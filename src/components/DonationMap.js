import React, { forwardRef, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { DEFAULT_LOCATION } from '../services/config';
import LeafletMap from './LeafletMap';

const STATUS_COLORS = (c) => ({
  available: c.primary,
  reserved: '#E08A2E',
  onTheWay: '#7B5CD6',
  collected: '#2F7BD6',
  cancelled: '#D64B4B',
});

// Mapa de donaciones: traduce donaciones a marcadores con el color de su estado.
const DonationMap = forwardRef(function DonationMap({ donations, user, selectedId, onSelect, interactive = true, style }, ref) {
  const { colors, mode } = useTheme();
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const palette = STATUS_COLORS(colors);
  const markers = useMemo(
    () => donations.map((d, i) => ({ id: d.id, lat: d.lat, lng: d.lng, color: palette[d.status] || palette.available, label: String(i + 1) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [donations, mode]
  );
  return (
    <View style={[{ flex: 1 }, style]}>
      <LeafletMap
        ref={ref}
        markers={markers}
        user={user}
        center={user || DEFAULT_LOCATION}
        dark={mode === 'dark'}
        interactive={interactive}
        selectedId={selectedId}
        onSelect={onSelect}
        onError={() => setFailed(true)}
        labels={{ error: t('map.loadError') }}
      />
      {failed ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 12, right: 12, top: 12, backgroundColor: colors.redSoft, padding: 10, borderRadius: 12 }}>
          <Text style={{ color: colors.red, fontSize: 12, fontWeight: '700' }}>{t('map.loadError')}</Text>
        </View>
      ) : null}
    </View>
  );
});

export default DonationMap;
