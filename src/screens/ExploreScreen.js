import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useData } from '../context/DataContext';
import { useLocation } from '../context/LocationContext';
import { useRouter } from '../navigation/Router';
import { CATEGORIES, isFinal } from '../services/donations';
import { distanceKm, formatDistance } from '../services/geo';
import { EmptyState, Header, Icon, IconButton, Screen, SectionTitle } from '../components/ui';
import { DonationCard } from '../components/DonationCard';
import DonationMap from '../components/DonationMap';

const makeStyles = (c) =>
  StyleSheet.create({
    search: { height: 52, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginBottom: 12 },
    input: { flex: 1, color: c.ink, fontSize: 14, paddingVertical: 0, height: '100%' },
    chips: { gap: 8, paddingBottom: 14 },
    chip: { paddingHorizontal: 15, height: 36, borderRadius: 18, backgroundColor: c.surfaceAlt, justifyContent: 'center' },
    chipActive: { backgroundColor: c.primary },
    chipText: { fontSize: 13, color: c.muted, fontWeight: '700' },
    chipTextActive: { color: c.onPrimary },
    mapBox: { height: 190, borderRadius: 22, overflow: 'hidden', marginBottom: 22, borderWidth: 1, borderColor: c.line },
    mapOpen: { position: 'absolute', right: 10, top: 10, backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 11, height: 34, flexDirection: 'row', alignItems: 'center', gap: 6 },
    mapOpenText: { fontSize: 12, fontWeight: '800', color: c.ink },
    mapLabel: { position: 'absolute', left: 10, bottom: 10, backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 10, height: 30, flexDirection: 'row', alignItems: 'center', gap: 5 },
  });

export default function ExploreScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { donations, notifications } = useData();
  const loc = useLocation();
  const { go } = useRouter();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => { loc.request(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const items = useMemo(
    () =>
      donations
        .filter((d) => !isFinal(d))
        .filter((d) => filter === 'all' || d.category === filter)
        .filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()))
        .map((d) => ({ d, km: distanceKm(loc.coords, d) }))
        .sort((a, b) => a.km - b.km),
    [donations, filter, query, loc.coords]
  );

  return (
    <Screen>
      <Header title={t('explore.title')} subtitle={t('explore.subtitle')} right={<IconButton name="notifications-outline" label={t('notif.title')} dot={notifications.some((n) => !n.read)} onPress={() => go('notifications')} />} />

      <View style={s.search}>
        <Icon name="search-outline" size={20} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder={t('explore.search')} placeholderTextColor={colors.placeholder} style={s.input} accessibilityLabel={t('explore.search')} />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}><Icon name="close-circle" size={19} color={colors.muted} /></Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {['all', ...CATEGORIES].map((c) => (
          <Pressable key={c} accessibilityRole="button" onPress={() => setFilter(c)} style={[s.chip, filter === c && s.chipActive]}>
            <Text style={[s.chipText, filter === c && s.chipTextActive]}>{t(`cat.${c}`)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.mapBox}>
        <DonationMap donations={items.map((x) => x.d)} user={loc.granted ? loc.coords : null} interactive={false} />
        <Pressable accessibilityRole="button" accessibilityLabel={t('explore.openMap')} onPress={() => go('map')} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={s.mapOpen} pointerEvents="none">
          <Icon name="expand-outline" size={16} color={colors.ink} />
          <Text style={s.mapOpenText}>{t('explore.openMap')}</Text>
        </View>
        {items[0] ? (
          <View style={s.mapLabel} pointerEvents="none">
            <Icon name="navigate-outline" size={14} color={colors.accent} />
            <Text style={s.mapOpenText}>{formatDistance(items[0].km)}</Text>
          </View>
        ) : null}
      </View>

      <SectionTitle title={items.length === 1 ? t('explore.foundOne') : t('explore.found', { n: items.length })} />
      {items.length === 0 ? <EmptyState icon="search-outline" text={t('explore.empty')} /> : null}
      {items.map(({ d, km }) => (
        <DonationCard key={d.id} item={d} distanceKm={km} onPress={() => go('detail', { id: d.id })} />
      ))}
    </Screen>
  );
}
