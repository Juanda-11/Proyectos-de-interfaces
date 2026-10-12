import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLocation } from '../context/LocationContext';
import { useRouter } from '../navigation/Router';
import { computeImpact, isFinal, isMine } from '../services/donations';
import { distanceKm } from '../services/geo';
import { greetingKey } from '../utils';
import { Avatar, Button, Card, EmptyState, Icon, IconButton, Pill, Screen, SectionTitle } from '../components/ui';
import { DonationCard } from '../components/DonationCard';

const makeStyles = (c) =>
  StyleSheet.create({
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    eyebrow: { fontSize: 11, fontWeight: '800', color: c.accent, letterSpacing: 1.2 },
    greeting: { fontSize: 28, fontWeight: '900', color: c.ink, marginTop: 2 },
    headRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    hero: { borderRadius: 26, padding: 22, overflow: 'hidden', marginBottom: 24, minHeight: 230 },
    heroTitle: { fontSize: 27, fontWeight: '900', color: c.onHero, lineHeight: 32, marginTop: 14, maxWidth: 300 },
    heroBody: { color: c.onHeroMuted, fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 300 },
    heroLeaf: { position: 'absolute', right: 18, top: 18, opacity: 0.9 },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    quick: { width: '47.8%', minHeight: 94, backgroundColor: c.surface, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: c.line, justifyContent: 'space-between' },
    quickIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontSize: 14, fontWeight: '800', color: c.ink },
    stats: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    stat: { flex: 1, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 13, minHeight: 104 },
    statIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
    statValue: { fontSize: 20, fontWeight: '900', color: c.ink },
    statLabel: { fontSize: 12, color: c.muted, marginTop: 3 },
  });

export default function HomeScreen() {
  const s = useStyles(makeStyles);
  const { colors, mode, toggle } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const { donations, notifications } = useData();
  const loc = useLocation();
  const { go } = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const isDonor = user.role === 'donor';

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    loc.request();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const impact = computeImpact(donations, user);
  const unread = notifications.some((n) => n.userId === user.id && !n.read);
  const firstName = user.name.split(' ')[0];

  const list = (isDonor
    ? donations.filter((d) => isMine(d, user))
    : donations.filter((d) => d.status === 'available' || (isMine(d, user) && !isFinal(d)))
  ).slice(0, 3);

  const quick = [
    isDonor
      ? { icon: 'camera-outline', label: t('home.analyze'), to: 'publish' }
      : { icon: 'search-outline', label: t('nav.explore'), to: 'explore' },
    { icon: 'map-outline', label: t('home.map'), to: 'map' },
    { icon: 'qr-code-outline', label: t('home.tracking'), to: 'activity' },
    { icon: 'stats-chart-outline', label: t('home.impact'), to: 'impact' },
  ];
  const stats = [
    { icon: 'leaf-outline', value: `${impact.kg} kg`, label: t('home.food') },
    { icon: 'cube-outline', value: String(impact.deliveries), label: t('home.deliveries') },
    { icon: 'people-outline', value: String(impact.allies), label: t('home.allies') },
  ];

  return (
    <Screen>
      <View style={s.head}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>{t(greetingKey())} 👋</Text>
          <Text style={s.greeting} accessibilityRole="header" numberOfLines={1}>{t('greeting.hello', { name: firstName })}</Text>
        </View>
        <View style={s.headRight}>
          <IconButton name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} label={t('home.toggleTheme')} onPress={toggle} />
          <IconButton name="notifications-outline" label={t('notif.title')} dot={unread} onPress={() => go('notifications')} />
          <Avatar name={user.name} onPress={() => go('profile')} />
        </View>
      </View>

      <Animated.View style={{ opacity: fade }}>
        <LinearGradient colors={[colors.heroFrom, colors.heroTo]} style={s.hero}>
          <View style={s.heroLeaf}><Icon name="leaf" size={56} color="#DDF5B2" /></View>
          <Pill tone="neutral" icon="sparkles-outline" style={{ backgroundColor: 'rgba(255,255,255,.92)' }}>FoodLink IA</Pill>
          <Text style={s.heroTitle}>{t(isDonor ? 'home.heroDonorTitle' : 'home.heroReceiverTitle')}</Text>
          <Text style={s.heroBody}>{t(isDonor ? 'home.heroDonorBody' : 'home.heroReceiverBody')}</Text>
          <Button
            variant="lime" small style={{ alignSelf: 'flex-start', marginTop: 18 }}
            label={t(isDonor ? 'home.heroDonorCta' : 'home.heroReceiverCta')} icon="arrow-forward"
            onPress={() => go(isDonor ? 'publish' : 'explore')}
          />
        </LinearGradient>
      </Animated.View>

      <SectionTitle title={t('home.quick')} />
      <View style={s.quickGrid}>
        {quick.map((q) => (
          <Pressable key={q.to} accessibilityRole="button" onPress={() => go(q.to)} style={({ pressed }) => [s.quick, pressed && { opacity: 0.8 }]}>
            <View style={s.quickIcon}><Icon name={q.icon} size={22} color={colors.accent} /></View>
            <Text style={s.quickLabel}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title={t('home.yourImpact')} action={t('common.seeAll')} onAction={() => go('impact')} />
      <View style={s.stats}>
        {stats.map((x) => (
          <View key={x.label} style={s.stat}>
            <View style={s.statIcon}><Icon name={x.icon} size={17} color={colors.accent} /></View>
            <Text style={s.statValue}>{x.value}</Text>
            <Text style={s.statLabel}>{x.label}</Text>
          </View>
        ))}
      </View>

      <SectionTitle
        title={t(isDonor ? 'home.myDonations' : 'home.nearYou')}
        action={t('common.seeMore')}
        onAction={() => go(isDonor ? 'activity' : 'explore')}
      />
      {list.length === 0 ? (
        <Card><EmptyState text={t(isDonor ? 'home.emptyDonor' : 'home.emptyReceiver')} /></Card>
      ) : (
        list.map((d) => (
          <DonationCard key={d.id} item={d} distanceKm={distanceKm(loc.coords, d)} onPress={() => go('detail', { id: d.id })} />
        ))
      )}
    </Screen>
  );
}
