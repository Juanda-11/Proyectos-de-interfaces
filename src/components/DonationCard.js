import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { CATEGORY_ICONS, CATEGORY_TONES } from '../services/donations';
import { formatDistance } from '../services/geo';
import { Icon, Pill, STATUS_TONE } from './ui';

const makeStyles = (c) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 14, marginBottom: 11, flexDirection: 'row', alignItems: 'center', gap: 12 },
    icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    photo: { width: 52, height: 52 },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
    title: { fontSize: 15, fontWeight: '800', color: c.ink, flexShrink: 1 },
    meta: { fontSize: 12, color: c.muted, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7, flexWrap: 'wrap' },
    metaText: { fontSize: 11, color: c.muted, marginRight: 6 },
  });

export function toneColors(colors, tone) {
  return {
    orange: [colors.orangeSoft, colors.orange],
    purple: [colors.purpleSoft, colors.purple],
    blue: [colors.blueSoft, colors.blue],
    green: [colors.mint, colors.accent],
  }[tone];
}

export function DonationIcon({ donation, size = 52 }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const [bg, fg] = toneColors(colors, CATEGORY_TONES[donation.category] || 'green');
  return (
    <View style={[s.icon, { backgroundColor: bg, width: size, height: size, borderRadius: size * 0.3 }]}>
      {donation.photo ? (
        <Image source={{ uri: donation.photo }} style={{ width: size, height: size }} />
      ) : (
        <Icon name={CATEGORY_ICONS[donation.category] || 'basket-outline'} size={size * 0.48} color={fg} />
      )}
    </View>
  );
}

export function DonationCard({ item, distanceKm, onPress }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.8 }]}
    >
      <DonationIcon donation={item} />
      <View style={{ flex: 1 }}>
        <View style={s.top}>
          <Text style={s.title} numberOfLines={1}>{item.title}</Text>
          <Pill tone={STATUS_TONE[item.status]}>{t(`status.${item.status}`)}</Pill>
        </View>
        <Text style={s.meta}>{item.qty} · {t(`cat.${item.category}`)}</Text>
        <View style={s.row}>
          <Icon name="location-outline" size={14} color={colors.muted} />
          <Text style={s.metaText}>{formatDistance(distanceKm)}</Text>
          <Icon name="storefront-outline" size={14} color={colors.muted} />
          <Text style={[s.metaText, { flexShrink: 1 }]} numberOfLines={1}>{item.donorName}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.chevron} />
    </Pressable>
  );
}
