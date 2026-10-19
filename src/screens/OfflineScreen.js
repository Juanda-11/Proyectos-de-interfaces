import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { Button, Icon } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: c.bg },
    icon: { width: 84, height: 84, borderRadius: 28, backgroundColor: c.orangeSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '800', color: c.ink, textAlign: 'center' },
    body: { fontSize: 14, lineHeight: 21, color: c.muted, textAlign: 'center', marginTop: 8, marginBottom: 24, maxWidth: 300 },
  });

// Se muestra cuando no se puede contactar al backend (sin internet o servidor caído).
export default function OfflineScreen({ onRetry }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const retry = async () => {
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.page}>
      <View style={s.icon}>
        <Icon name="cloud-offline-outline" size={40} color={colors.orange} />
      </View>
      <Text style={s.title}>{t('errors.offlineTitle')}</Text>
      <Text style={s.body}>{t('errors.offlineBody')}</Text>
      <Button label={t('common.retry')} icon="refresh-outline" onPress={retry} loading={busy} />
    </View>
  );
}
