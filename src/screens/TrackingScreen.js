import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { STAGES } from '../services/donations';
import { formatDateTime } from '../utils';
import { useFeedback } from '../components/Feedback';
import { Button, Field, Header, Icon, Pill, Screen } from '../components/ui';
import { DonationIcon } from '../components/DonationCard';
import { StageProgress, stageIcon } from '../components/StageProgress';

const makeStyles = (c) =>
  StyleSheet.create({
    summary: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
    sumTitle: { fontSize: 16, fontWeight: '800', color: c.ink },
    sumMeta: { fontSize: 12, color: c.muted, marginTop: 3 },
    stageCard: { backgroundColor: c.surface, borderRadius: 26, borderWidth: 1, borderColor: c.line, padding: 22, marginTop: 14 },
    stageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
    stageNo: { fontSize: 12, fontWeight: '800', color: c.muted, letterSpacing: 0.4 },
    arrows: { flexDirection: 'row', gap: 6 },
    arrow: { width: 36, height: 36, borderRadius: 12, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    bigIcon: { width: 74, height: 74, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    stageTitle: { fontSize: 24, fontWeight: '900', color: c.ink, marginBottom: 8 },
    stageDesc: { fontSize: 14, lineHeight: 21, color: c.muted, marginBottom: 14 },
    time: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
    timeText: { fontSize: 12, color: c.muted, fontWeight: '600' },
    action: { marginTop: 20, gap: 12 },
    codeBox: { alignItems: 'center', backgroundColor: c.bg, borderRadius: 20, padding: 18, gap: 10, borderWidth: 1, borderColor: c.line },
    qrBg: { backgroundColor: '#fff', padding: 12, borderRadius: 16 },
    codeText: { fontSize: 22, fontWeight: '900', color: c.ink, letterSpacing: 2 },
    hint: { fontSize: 12, color: c.muted, textAlign: 'center', lineHeight: 17 },
    waiting: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 14 },
    waitText: { flex: 1, color: c.muted, fontSize: 13, fontWeight: '600' },
    cancelBtn: { alignItems: 'center', paddingVertical: 18 },
    cancelText: { color: c.red, fontSize: 13, fontWeight: '800' },
    successBox: { backgroundColor: c.mint, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' },
  });

export default function TrackingScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { donations, reserve, startPickup, confirmDelivery, cancel } = useData();
  const { confirm, toast } = useFeedback();
  const { params, back } = useRouter();
  const item = donations.find((d) => d.id === params.id);

  const currentIndex = item ? Math.max(0, STAGES.indexOf(item.status === 'cancelled' ? Object.keys(item.history).filter((k) => k !== 'cancelled').pop() : item.status)) : 0;
  const [selected, setSelected] = useState(currentIndex);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const slide = useRef(new Animated.Value(1)).current;

  // Al avanzar de etapa, la vista salta automáticamente a la nueva etapa.
  useEffect(() => { setSelected(currentIndex); setCode(''); setCodeError(''); }, [currentIndex]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Animated.Value.setValue no es estado de React
    slide.setValue(0);
    Animated.timing(slide, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [selected, slide]);
  useEffect(() => { if (!item) back(); }, [item, back]);
  if (!item) return null;

  const cancelled = item.status === 'cancelled';
  const isDonor = item.donorId === user.id;
  const isReceiver = user.role === 'receiver';
  const stage = STAGES[selected];
  const isCurrent = selected === currentIndex && !cancelled;
  const isDone = selected < currentIndex || (stage === 'collected' && item.status === 'collected');
  const at = item.history?.[stage];

  const doReserve = () => { reserve(item, user); toast(t('notif.reservedBody', { title: item.title })); };
  const doStart = () => startPickup(item);
  const doConfirmCode = () => {
    if (confirmDelivery(item, code)) toast(t('notif.collectedBody', { title: item.title }));
    else setCodeError(t('tracking.wrongCode'));
  };
  const doHandoff = () => { confirmDelivery(item, item.code); toast(t('notif.collectedBody', { title: item.title })); };
  const doCancel = async () => {
    const ok = await confirm({ title: t('tracking.cancelAsk'), body: t('tracking.cancelBody'), confirmLabel: t('tracking.cancel'), danger: true });
    if (ok) cancel(item);
  };

  const codeCard = (
    <View style={s.codeBox}>
      <View style={s.qrBg}><QRCode value={item.code} size={132} color="#17231D" backgroundColor="#fff" /></View>
      <Text style={s.codeText}>{item.code}</Text>
      <Text style={s.hint}>{t('tracking.showCode')}</Text>
    </View>
  );
  const waiting = (text) => (
    <View style={s.waiting}>
      <Icon name="hourglass-outline" size={18} color={colors.muted} />
      <Text style={s.waitText}>{text}</Text>
    </View>
  );

  let action = null;
  if (stage === 'collected' && isDone) {
    action = (
      <View style={s.successBox}>
        <Icon name="heart" size={20} color={colors.accent} />
        <Text style={[s.waitText, { color: colors.ink }]}>{t('tracking.completed')}</Text>
      </View>
    );
  } else if (isCurrent) {
    if (stage === 'available') {
      action = isReceiver && !isDonor ? <Button label={t('detail.reserve')} icon="bookmark-outline" onPress={doReserve} /> : waiting(t('tracking.a_available'));
    } else if (stage === 'reserved') {
      action = isReceiver && item.receiverId === user.id ? <Button label={t('tracking.a_reserved')} icon="bicycle-outline" onPress={doStart} /> : waiting(t('tracking.waitPickup'));
    } else if (stage === 'onTheWay') {
      action = isDonor ? (
        <>
          {codeCard}
          <Button label={t('tracking.a_onTheWay')} icon="checkmark-done-outline" onPress={doHandoff} />
        </>
      ) : (
        <>
          <Field label={t('tracking.code')} icon="key-outline" value={code} onChangeText={(v) => { setCode(v); setCodeError(''); }} placeholder={t('tracking.codePh')} autoCapitalize="characters" error={codeError} style={{ marginBottom: 0 }} />
          <Text style={s.hint}>{t('tracking.codeHint')}</Text>
          <Button label={t('tracking.a_onTheWay')} icon="checkmark-done-outline" onPress={doConfirmCode} disabled={!code.trim()} />
        </>
      );
    }
  }

  const tone = isDone ? [colors.mint, colors.accent] : isCurrent ? [colors.orangeSoft, colors.orange] : [colors.surfaceAlt, colors.muted];
  const chip = isDone ? <Pill tone="green" icon="checkmark">{t('tracking.done')}</Pill> : isCurrent ? <Pill tone="orange" icon="radio-button-on">{t('tracking.current')}</Pill> : <Pill tone="neutral">{t('tracking.pending')}</Pill>;

  return (
    <Screen>
      <Header title={item.title} subtitle={`${item.qty} · ${t(`cat.${item.category}`)}`} onBack={back} />

      <View style={s.summary}>
        <DonationIcon donation={item} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={s.sumTitle}>{item.donorName}</Text>
          <Text style={s.sumMeta} numberOfLines={1}>{item.address}</Text>
        </View>
        {cancelled ? <Pill tone="red">{t('status.cancelled')}</Pill> : null}
      </View>

      <StageProgress currentIndex={currentIndex} selectedIndex={selected} onSelect={setSelected} cancelled={cancelled} />

      <Animated.View style={[s.stageCard, { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
        <View style={s.stageTop}>
          <Text style={s.stageNo}>{t('tracking.stageOf', { a: selected + 1, b: STAGES.length }).toUpperCase()}</Text>
          <View style={s.arrows}>
            <Pressable accessibilityLabel={t('tracking.prev')} disabled={selected === 0} onPress={() => setSelected(selected - 1)} style={[s.arrow, selected === 0 && { opacity: 0.35 }]}>
              <Icon name="chevron-back" size={18} />
            </Pressable>
            <Pressable accessibilityLabel={t('tracking.nextStage')} disabled={selected >= currentIndex} onPress={() => setSelected(selected + 1)} style={[s.arrow, selected >= currentIndex && { opacity: 0.35 }]}>
              <Icon name="chevron-forward" size={18} />
            </Pressable>
          </View>
        </View>
        <View style={[s.bigIcon, { backgroundColor: tone[0] }]}>
          <Icon name={stageIcon(stage)} size={34} color={tone[1]} />
        </View>
        {chip}
        <Text style={[s.stageTitle, { marginTop: 12 }]}>{t(`tracking.s_${stage}`)}</Text>
        <Text style={s.stageDesc}>{t(`tracking.d_${stage}`)}</Text>
        <View style={s.time}>
          <Icon name="time-outline" size={15} color={colors.muted} />
          <Text style={s.timeText}>{at ? t('tracking.at', { time: formatDateTime(at, lang) }) : t('tracking.waiting')}</Text>
        </View>
        {action ? <View style={s.action}>{action}</View> : null}
      </Animated.View>

      {cancelled ? (
        <View style={[s.waiting, { marginTop: 14, backgroundColor: colors.redSoft }]}>
          <Icon name="close-circle-outline" size={20} color={colors.red} />
          <Text style={[s.waitText, { color: colors.red }]}>{t('tracking.cancelled')}</Text>
        </View>
      ) : item.status !== 'collected' ? (
        <Pressable accessibilityRole="button" onPress={doCancel} style={s.cancelBtn}>
          <Text style={s.cancelText}>{t('tracking.cancel')}</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
