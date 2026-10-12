import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { computeImpact } from '../services/donations';
import { formatDate } from '../utils';
import { useFeedback } from '../components/Feedback';
import { Avatar, Button, Header, Icon, IconButton, Pill, Screen } from '../components/ui';
import { Pressable } from 'react-native';

const makeStyles = (c) =>
  StyleSheet.create({
    hero: { borderRadius: 28, padding: 22, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
    name: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 14 },
    email: { color: c.onHeroMuted, fontSize: 13, marginTop: 3 },
    pills: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
    since: { color: c.onHeroMuted, fontSize: 11, marginTop: 12 },
    stats: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    stat: { flex: 1, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.line, paddingVertical: 14, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '900', color: c.ink },
    statLabel: { fontSize: 11, color: c.muted, marginTop: 2 },
    group: { fontSize: 12, fontWeight: '800', color: c.muted, letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
    menu: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 22, paddingHorizontal: 14, marginBottom: 18 },
    row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
    rowLast: { borderBottomWidth: 0 },
    rowIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: c.ink },
    rowValue: { fontSize: 12, color: c.muted, fontWeight: '600' },
    version: { textAlign: 'center', color: c.placeholder, fontSize: 11, paddingVertical: 20 },
  });

export function MenuRow({ icon, label, value, onPress, last }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.row, last && s.rowLast, pressed && { opacity: 0.6 }]}>
      <View style={s.rowIcon}><Icon name={icon} size={19} color={colors.accent} /></View>
      <Text style={s.rowLabel}>{label}</Text>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      <Icon name="chevron-forward" size={18} color={colors.chevron} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const s = useStyles(makeStyles);
  const { colors, mode } = useTheme();
  const { t, lang } = useI18n();
  const { user, signOut } = useAuth();
  const { donations } = useData();
  const { confirm } = useFeedback();
  const { go } = useRouter();
  const impact = computeImpact(donations, user);

  const logout = async () => {
    const ok = await confirm({ title: t('profile.logoutAsk'), body: t('profile.logoutBody'), confirmLabel: t('profile.logout'), danger: true });
    if (ok) signOut();
  };

  return (
    <Screen>
      <Header title={t('profile.title')} subtitle={t('profile.subtitle')} right={<IconButton name="settings-outline" label={t('profile.settings')} onPress={() => go('settings')} />} />

      <LinearGradient colors={[colors.heroFrom, colors.heroTo]} style={s.hero}>
        <Avatar name={user.name} size={86} radius={30} />
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.pills}>
          <Pill tone="neutral" icon={user.role === 'donor' ? 'gift-outline' : 'hand-left-outline'} style={{ backgroundColor: 'rgba(255,255,255,.92)' }}>{t(`profile.${user.role}`)}</Pill>
          <Pill tone="green" icon="shield-checkmark-outline" style={{ backgroundColor: colors.lime }}>{t('profile.verified')}</Pill>
        </View>
        <Text style={s.since}>{t('profile.memberSince', { date: formatDate(user.createdAt, lang) })}</Text>
      </LinearGradient>

      <View style={s.stats}>
        {[[impact.kg, t('profile.statKg')], [impact.deliveries, t('profile.statDeliveries')], [impact.allies, t('profile.statAllies')]].map(([v, l]) => (
          <View key={l} style={s.stat}>
            <Text style={s.statValue}>{v}</Text>
            <Text style={s.statLabel}>{l}</Text>
          </View>
        ))}
      </View>

      <Text style={s.group}>{t('profile.account').toUpperCase()}</Text>
      <View style={s.menu}>
        <MenuRow icon="person-outline" label={t('profile.personal')} onPress={() => go('personal')} />
        <MenuRow icon="shield-checkmark-outline" label={t('profile.security')} onPress={() => go('security')} last />
      </View>

      <Text style={s.group}>{t('profile.preferences').toUpperCase()}</Text>
      <View style={s.menu}>
        <MenuRow icon="notifications-outline" label={t('profile.notifications')} onPress={() => go('notifications')} />
        <MenuRow icon="language-outline" label={t('settings.language')} value={lang === 'es' ? 'Español' : 'English'} onPress={() => go('settings')} />
        <MenuRow icon={mode === 'dark' ? 'moon-outline' : 'sunny-outline'} label={t('settings.theme')} value={t(mode === 'dark' ? 'settings.dark' : 'settings.light')} onPress={() => go('settings')} />
        <MenuRow icon="settings-outline" label={t('profile.settings')} onPress={() => go('settings')} last />
      </View>

      <Text style={s.group}>{t('profile.support').toUpperCase()}</Text>
      <View style={s.menu}>
        <MenuRow icon="help-circle-outline" label={t('profile.help')} onPress={() => go('help')} last />
      </View>

      <Button variant="danger" icon="log-out-outline" label={t('profile.logout')} onPress={logout} />
      <Text style={s.version}>{t('profile.version')}</Text>
    </Screen>
  );
}
