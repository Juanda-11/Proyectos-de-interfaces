import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { Button, Icon } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg, padding: 26, justifyContent: 'center', alignItems: 'center' },
    circle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '900', color: c.ink, textAlign: 'center' },
    body: { color: c.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 22, maxWidth: 320 },
    qrCard: { backgroundColor: c.surface, borderRadius: 24, padding: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: c.line, marginBottom: 18 },
    qrBg: { backgroundColor: '#fff', padding: 12, borderRadius: 16 },
    qrTitle: { fontSize: 12, color: c.muted, marginTop: 14 },
    qrText: { fontSize: 22, fontWeight: '900', color: c.ink, marginTop: 4, letterSpacing: 2 },
  });

export default function PublishedScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { donations } = useData();
  const { params, go } = useRouter();
  const item = donations.find((d) => d.id === params.id);
  const pop = useRef(new Animated.Value(0.6)).current;
  useEffect(() => { Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start(); }, [pop]);

  return (
    <View style={s.page}>
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        <LinearGradient colors={[colors.primary, colors.green2]} style={s.circle}>
          <Icon name="checkmark" size={54} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <Text style={s.title}>{t('published.title')}</Text>
      <Text style={s.body}>{t('published.body')}</Text>
      {item ? (
        <View style={s.qrCard}>
          <View style={s.qrBg}><QRCode value={item.code} size={128} color="#17231D" backgroundColor="#fff" /></View>
          <Text style={s.qrTitle}>{t('published.code')}</Text>
          <Text style={s.qrText}>{item.code}</Text>
        </View>
      ) : null}
      <View style={{ alignSelf: 'stretch', gap: 10 }}>
        <Button label={t('published.track')} icon="arrow-forward" onPress={() => go('tracking', { id: params.id })} />
        <Button variant="secondary" label={t('published.home')} onPress={() => go('home')} />
      </View>
    </View>
  );
}
