import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useRouter } from '../navigation/Router';
import { useAuth } from '../context/AuthContext';
import { Icon } from './ui';

const makeStyles = (c) =>
  StyleSheet.create({
    bar: { height: 78, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', paddingHorizontal: 6, paddingBottom: Platform.OS === 'ios' ? 8 : 4 },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
    label: { fontSize: 11, color: c.muted, fontWeight: '700' },
    labelActive: { color: c.accent },
    fab: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: -24, borderWidth: 4, borderColor: c.bg, elevation: 5, shadowColor: c.shadow, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  });

// La pestaña central depende del rol: los donantes publican, los receptores ven el mapa.
const tabsFor = (role) => [
  ['home-outline', 'nav.home', 'home'],
  ['search-outline', 'nav.explore', 'explore'],
  role === 'donor' ? ['add', 'nav.publish', 'publish'] : ['map-outline', 'nav.map', 'map'],
  ['pulse-outline', 'nav.activity', 'activity'],
  ['person-outline', 'nav.profile', 'profile'],
];

// Qué pantallas secundarias pertenecen a cada pestaña.
const GROUPS = {
  explore: ['detail'],
  activity: ['tracking', 'notifications'],
  profile: ['personal', 'security', 'help', 'settings'],
  home: ['impact'],
  publish: ['published'],
  map: [],
};

export function BottomNav() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { screen, go } = useRouter();
  const { user } = useAuth();
  const tabs = tabsFor(user?.role);
  return (
    <View style={s.bar} accessibilityRole="tablist">
      {tabs.map(([icon, label, key]) => {
        const active = screen === key || GROUPS[key]?.includes(screen);
        return (
          <Pressable key={key} accessibilityRole="tab" accessibilityLabel={t(label)} accessibilityState={{ selected: active }} onPress={() => go(key)} style={s.item}>
            {key === 'publish' || key === 'map' ? (
              <LinearGradient colors={[colors.primary, colors.green2]} style={s.fab}>
                <Icon name={key === 'map' ? 'map' : icon} size={26} color="#fff" />
              </LinearGradient>
            ) : (
              <>
                <Icon name={active ? icon.replace('-outline', '') : icon} size={23} color={active ? colors.accent : colors.muted} />
                <Text style={[s.label, active && s.labelActive]}>{t(label)}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
