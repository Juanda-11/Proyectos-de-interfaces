import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLocation } from '../context/LocationContext';
import { useRouter } from '../navigation/Router';
import { distanceKm, formatDistance } from '../services/geo';
import { isMine } from '../services/donations';
import { useFeedback } from '../components/Feedback';
import { Button, Header, Icon, Pill, Screen, SectionTitle, STATUS_TONE } from '../components/ui';
import { DonationIcon } from '../components/DonationCard';

const makeStyles = (c) =>
  StyleSheet.create({
    image: { height: 200, borderRadius: 26, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    title: { fontSize: 30, fontWeight: '900', color: c.ink, marginTop: 10 },
    by: { color: c.muted, fontSize: 13, marginTop: 4 },
    stats: { flexDirection: 'row', gap: 10, marginVertical: 20 },
    stat: { flex: 1, backgroundColor: c.surface, borderRadius: 18, padding: 13, borderWidth: 1, borderColor: c.line },
    statValue: { fontSize: 16, fontWeight: '800', color: c.ink, marginTop: 8 },
    statLabel: { fontSize: 11, color: c.muted, marginTop: 2 },
    box: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.line, paddingHorizontal: 15, marginBottom: 14 },
    row: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
    rowLabel: { flex: 1, fontSize: 13, color: c.muted },
    rowValue: { fontSize: 13, fontWeight: '800', color: c.ink, textAlign: 'right', maxWidth: '58%' },
    tip: { borderRadius: 18, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'center' },
    tipText: { flex: 1, color: c.muted, fontSize: 12, lineHeight: 17 },
  });

function Row({ icon, label, value }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={s.row}>
      <Icon name={icon} size={18} color={colors.accent} />
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

export default function DetailScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const { donations, reserve } = useData();
  const loc = useLocation();
  const { toast, toastError } = useFeedback();
  const [busy, setBusy] = useState(false);
  const { params, go, back } = useRouter();
  const item = donations.find((d) => d.id === params.id);

  useEffect(() => {
    if (!item) back();
  }, [item, back]);
  if (!item) return null;

  const own = item.donorId === user.id;
  const mine = isMine(item, user);
  const qtyValue = item.qty.split(' ')[0];

  const onReserve = async () => {
    setBusy(true);
    try {
      await reserve(item);
      toast(t('notif.reservedBody', { title: item.title }));
      go('tracking', { id: item.id });
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };

  let cta;
  if (item.status === 'available' && user.role === 'receiver') {
    cta = <Button label={t('detail.reserve')} icon="bookmark-outline" onPress={onReserve} loading={busy} />;
  } else if (mine || own) {
    cta = <Button label={t('detail.viewTracking')} icon="pulse-outline" onPress={() => go('tracking', { id: item.id })} />;
  } else if (item.status !== 'available') {
    cta = <Pill tone="orange" icon="information-circle-outline">{t('detail.reservedByOther')}</Pill>;
  }

  return (
    <Screen>
      <Header title="" onBack={back} right={<Button small variant="secondary" icon="map-outline" label={t('detail.viewOnMap')} onPress={() => go('map', { id: item.id })} />} />
      <View style={s.image}>
        {item.photo ? <Image source={{ uri: item.photo }} style={s.photo} resizeMode="cover" /> : <DonationIcon donation={item} size={96} />}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Pill tone={STATUS_TONE[item.status]}>{t(`status.${item.status}`)}</Pill>
        {item.ai ? <Pill tone="purple" icon="sparkles-outline">FoodLink IA</Pill> : null}
      </View>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.by}>{t('detail.publishedBy', { name: item.donorName })}</Text>

      <View style={s.stats}>
        {[
          ['basket-outline', qtyValue, t('detail.quantity')],
          ['location-outline', formatDistance(distanceKm(loc.coords, item)), t('detail.distance')],
          ['time-outline', t('publish.days', { n: item.shelfLifeDays ?? 1 }), t('detail.shelfLife')],
        ].map(([icon, value, label]) => (
          <View key={label} style={s.stat}>
            <Icon name={icon} size={19} color={colors.accent} />
            <Text style={s.statValue} numberOfLines={1}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title={t('detail.details')} />
      <View style={s.box}>
        <Row icon="pricetag-outline" label={t('detail.category')} value={t(`cat.${item.category}`)} />
        <Row icon="heart-outline" label={t('detail.condition')} value={t(`publish.fresh_${item.freshness || 'good'}`)} />
        <Row icon="location-outline" label={t('detail.pickup')} value={item.address} />
        {item.notes ? <Row icon="document-text-outline" label={t('detail.notes')} value={item.notes} /> : null}
      </View>

      {item.ai ? (
        <LinearGradient colors={[colors.mint, colors.surface]} style={s.tip}>
          <Icon name="sparkles-outline" size={21} color={colors.accent} />
          <Text style={s.tipText}>{t('detail.aiNote')}</Text>
        </LinearGradient>
      ) : null}
      {cta}
    </Screen>
  );
}
