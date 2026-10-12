import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useData } from '../context/DataContext';
import { useLocation } from '../context/LocationContext';
import { useRouter } from '../navigation/Router';
import { isFinal } from '../services/donations';
import { distanceKm, formatDistance } from '../services/geo';
import { Icon, IconButton, Pill, STATUS_TONE } from '../components/ui';
import { DonationIcon } from '../components/DonationCard';
import DonationMap from '../components/DonationMap';

const makeStyles = (c) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    topLeft: { position: 'absolute', top: 16, left: 16 },
    topRight: { position: 'absolute', top: 16, right: 16 },
    banner: { position: 'absolute', top: 70, left: 16, right: 16, backgroundColor: c.surface, borderRadius: 14, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: c.line },
    bannerText: { color: c.muted, fontSize: 12, flex: 1 },
    sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 22, shadowColor: c.shadow, shadowOpacity: 0.2, shadowRadius: 16, elevation: 12 },
    grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.line, marginBottom: 12 },
    eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1, color: c.accent },
    title: { fontSize: 21, fontWeight: '800', color: c.ink, marginTop: 3, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.line },
    rowTitle: { fontSize: 14, fontWeight: '800', color: c.ink },
    rowMeta: { fontSize: 12, color: c.muted, marginTop: 3 },
    dot: { width: 12, height: 12, borderRadius: 6 },
  });

export default function MapScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { donations } = useData();
  const loc = useLocation();
  const { go, back, canGoBack, params } = useRouter();
  const [selectedId, setSelectedId] = useState(params.id || null);
  const mapRef = useRef(null);

  useEffect(() => { loc.request(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const items = useMemo(
    () =>
      donations
        .filter((d) => !isFinal(d))
        .map((d) => ({ d, km: distanceKm(loc.coords, d) }))
        .sort((a, b) => a.km - b.km),
    [donations, loc.coords]
  );
  const selected = items.find((x) => x.d.id === selectedId);
  const palette = { available: colors.primary, reserved: '#E08A2E', onTheWay: '#7B5CD6' };

  return (
    <View style={s.root}>
      <DonationMap ref={mapRef} donations={items.map((x) => x.d)} user={loc.granted ? loc.coords : null} selectedId={selectedId} onSelect={setSelectedId} />

      <View style={s.topLeft}>
        <IconButton name="arrow-back" label={t('common.back')} onPress={() => (canGoBack ? back() : go('explore'))} />
      </View>
      <View style={s.topRight}>
        <IconButton name={loc.loading ? 'hourglass-outline' : 'locate-outline'} label={t('map.center')} onPress={() => { loc.request(true); mapRef.current?.flyTo(loc.coords); }} />
      </View>
      {loc.asked && !loc.granted ? (
        <View style={s.banner}>
          <Icon name="information-circle-outline" size={18} color={colors.muted} />
          <Text style={s.bannerText}>{t('map.denied')}</Text>
        </View>
      ) : null}

      <View style={s.sheet}>
        <View style={s.grab} />
        <Text style={s.eyebrow}>{t('map.eyebrow')}</Text>
        {selected ? (
          <>
            <Text style={s.title}>{selected.d.title}</Text>
            <Pressable accessibilityRole="button" onPress={() => go('detail', { id: selected.d.id })} style={s.row}>
              <DonationIcon donation={selected.d} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{t('map.viewDetail')}</Text>
                <Text style={s.rowMeta}>{formatDistance(selected.km)} · {selected.d.donorName}</Text>
                <View style={{ marginTop: 6 }}><Pill tone={STATUS_TONE[selected.d.status]}>{t(`status.${selected.d.status}`)}</Pill></View>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.chevron} />
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.title}>{t('map.points', { n: items.length })}</Text>
            {items.slice(0, 2).map(({ d, km }) => (
              <Pressable key={d.id} accessibilityRole="button" onPress={() => setSelectedId(d.id)} style={s.row}>
                <View style={[s.dot, { backgroundColor: palette[d.status] || colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{d.title}</Text>
                  <Text style={s.rowMeta}>{formatDistance(km)} · {t(`status.${d.status}`)}</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.chevron} />
              </Pressable>
            ))}
          </>
        )}
      </View>
    </View>
  );
}
