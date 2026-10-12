import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { computeImpact } from '../services/donations';
import { Card, Header, Icon, Screen, SectionTitle } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    hero: { borderRadius: 26, padding: 22, marginBottom: 22 },
    caption: { color: c.onHeroMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
    number: { color: '#fff', fontSize: 62, fontWeight: '900', marginTop: 4 },
    unit: { color: c.onHeroMuted, fontSize: 14, maxWidth: 230 },
    mini: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.18)' },
    miniValue: { color: '#fff', fontSize: 21, fontWeight: '800' },
    miniLabel: { color: c.onHeroMuted, fontSize: 11, marginTop: 2 },
    goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    goalTitle: { fontSize: 15, fontWeight: '800', color: c.ink },
    goalSub: { fontSize: 12, color: c.muted, marginTop: 3 },
    goalPct: { color: c.accent, fontSize: 24, fontWeight: '900' },
    track: { height: 8, backgroundColor: c.surfaceAlt, borderRadius: 10, overflow: 'hidden', marginTop: 12 },
    fill: { height: '100%', backgroundColor: c.green2, borderRadius: 10 },
    left: { color: c.muted, fontSize: 12, marginTop: 8 },
    badges: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    badge: { flex: 1, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 12, alignItems: 'center', gap: 8 },
    badgeIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontSize: 11, fontWeight: '700', color: c.ink, textAlign: 'center' },
    tip: { backgroundColor: c.orangeSoft, borderRadius: 20, padding: 15, flexDirection: 'row', gap: 12, alignItems: 'center' },
  });

const GOAL = 10;

export default function ImpactScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const { donations } = useData();
  const { go, back } = useRouter();
  const impact = computeImpact(donations, user);
  const isDonor = user.role === 'donor';
  const pct = Math.min(1, impact.kg / GOAL);
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(width, { toValue: pct, duration: 800, useNativeDriver: false }).start(); }, [pct, width]);

  const badges = [
    { icon: 'ribbon-outline', label: t('impact.b1'), on: impact.deliveries >= 1 },
    { icon: 'leaf-outline', label: t('impact.b2'), on: impact.kg >= 10 },
    { icon: 'people-outline', label: t('impact.b3'), on: impact.allies >= 5 },
  ];

  return (
    <Screen>
      <Header title={t('impact.title')} subtitle={t('impact.subtitle')} onBack={back} />
      <LinearGradient colors={[colors.heroFrom, colors.heroTo]} style={s.hero}>
        <Text style={s.caption}>{t('impact.caption')}</Text>
        <Text style={s.number}>{impact.kg}</Text>
        <Text style={s.unit}>{t(isDonor ? 'impact.unitDonor' : 'impact.unitReceiver')}</Text>
        <View style={s.mini}>
          {[[impact.deliveries, t('impact.deliveries')], [impact.allies, t('impact.allies')], [impact.people, t('impact.people')], [impact.co2, t('impact.co2')]].map(([v, l]) => (
            <View key={l} style={{ flexShrink: 1 }}>
              <Text style={s.miniValue}>{v}</Text>
              <Text style={s.miniLabel} numberOfLines={2}>{l}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <SectionTitle title={t('impact.goal')} />
      <Card style={{ marginBottom: 18 }}>
        <View style={s.goalTop}>
          <View>
            <Text style={s.goalTitle}>{t('impact.goalTitle', { n: GOAL })}</Text>
            <Text style={s.goalSub}>{t('impact.goalSub')}</Text>
          </View>
          <Text style={s.goalPct}>{Math.round(pct * 100)}%</Text>
        </View>
        <View style={s.track}>
          <Animated.View style={[s.fill, { width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>
        <Text style={s.left}>{pct >= 1 ? t('impact.goalDone') : t('impact.goalLeft', { n: Math.round((GOAL - impact.kg) * 10) / 10 })}</Text>
      </Card>

      <SectionTitle title={t('impact.badges')} />
      <View style={s.badges}>
        {badges.map((b) => (
          <View key={b.label} style={[s.badge, !b.on && { opacity: 0.5 }]}>
            <View style={[s.badgeIcon, { backgroundColor: b.on ? colors.mint : colors.surfaceAlt }]}>
              <Icon name={b.icon} size={21} color={b.on ? colors.accent : colors.muted} />
            </View>
            <Text style={s.badgeText}>{b.label}</Text>
          </View>
        ))}
      </View>

      <Card onPress={() => go(isDonor ? 'publish' : 'explore')} style={s.tip}>
        <Icon name="sparkles-outline" size={22} color={colors.orange} />
        <View style={{ flex: 1 }}>
          <Text style={s.goalTitle}>{t('impact.keep')}</Text>
          <Text style={s.goalSub}>{t(isDonor ? 'impact.keepDonor' : 'impact.keepBody')}</Text>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.muted} />
      </Card>
    </Screen>
  );
}
