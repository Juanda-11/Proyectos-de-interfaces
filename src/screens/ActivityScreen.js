import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { STAGES, isFinal, isMine } from '../services/donations';
import { EmptyState, Header, Icon, IconButton, Pill, Screen, Segmented, STATUS_TONE } from '../components/ui';
import { DonationIcon } from '../components/DonationCard';
import { MiniProgress } from '../components/StageProgress';

const makeStyles = (c) =>
  StyleSheet.create({
    summary: { backgroundColor: c.mint, borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    big: { fontSize: 42, fontWeight: '900', color: c.accent },
    sumTitle: { fontSize: 15, fontWeight: '800', color: c.ink },
    sumMeta: { fontSize: 12, color: c.muted, marginTop: 4, maxWidth: 210 },
    card: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 14, marginBottom: 12 },
    top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    title: { fontSize: 15, fontWeight: '800', color: c.ink, flexShrink: 1 },
    meta: { fontSize: 12, color: c.muted, marginTop: 3 },
    foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    stage: { fontSize: 12, fontWeight: '700', color: c.muted },
    open: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    openText: { fontSize: 12, fontWeight: '800', color: c.accent },
  });

export default function ActivityScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const { donations, notifications } = useData();
  const { go } = useRouter();
  const [tab, setTab] = useState('active');

  const mine = donations.filter((d) => isMine(d, user));
  const active = mine.filter((d) => !isFinal(d));
  const history = mine.filter(isFinal);
  const list = tab === 'active' ? active : history;

  return (
    <Screen>
      <Header
        title={t('tracking.title')}
        subtitle={t('tracking.subtitle')}
        right={<IconButton name="notifications-outline" label={t('notif.title')} dot={notifications.some((n) => n.userId === user.id && !n.read)} onPress={() => go('notifications')} />}
      />
      <View style={s.summary}>
        <Text style={s.big}>{active.length}</Text>
        <View>
          <Text style={s.sumTitle}>{t('tracking.activeCount')}</Text>
          <Text style={s.sumMeta}>{t('tracking.activeBody')}</Text>
        </View>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'active', label: `${t('tracking.tabActive')} (${active.length})`, icon: 'pulse-outline' },
            { value: 'history', label: `${t('tracking.history')} (${history.length})`, icon: 'time-outline' },
          ]}
        />
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          text={mine.length === 0 ? t(user.role === 'donor' ? 'tracking.emptyDonor' : 'tracking.emptyReceiver') : t('tracking.empty')}
          action={mine.length === 0 ? t(user.role === 'donor' ? 'nav.publish' : 'nav.explore') : undefined}
          onAction={() => go(user.role === 'donor' ? 'publish' : 'explore')}
        />
      ) : null}

      {list.map((d) => {
        const idx = Math.max(0, STAGES.indexOf(d.status));
        const cancelled = d.status === 'cancelled';
        return (
          <Pressable key={d.id} accessibilityRole="button" onPress={() => go('tracking', { id: d.id })} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
            <View style={s.top}>
              <DonationIcon donation={d} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={s.title} numberOfLines={1}>{d.title}</Text>
                <Text style={s.meta}>{d.qty} · {t(`cat.${d.category}`)}</Text>
              </View>
              <Pill tone={STATUS_TONE[d.status]}>{t(`status.${d.status}`)}</Pill>
            </View>
            <MiniProgress currentIndex={idx} cancelled={cancelled} />
            <View style={s.foot}>
              <Text style={s.stage}>{cancelled ? t('tracking.cancelled') : t('tracking.stageOf', { a: idx + 1, b: STAGES.length })}</Text>
              <View style={s.open}>
                <Text style={s.openText}>{t('tracking.open')}</Text>
                <Icon name="chevron-forward" size={15} color={colors.accent} />
              </View>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}
