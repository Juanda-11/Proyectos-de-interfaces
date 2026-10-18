import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { KEYS, loadJSON, saveJSON } from '../services/storage';
import { useFeedback } from '../components/Feedback';
import { Button, Card, Header, Screen, Segmented } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    group: { fontSize: 12, fontWeight: '800', color: c.muted, letterSpacing: 0.6, marginBottom: 8, marginLeft: 4, marginTop: 6 },
    card: { marginBottom: 18, gap: 14 },
    label: { fontSize: 14, fontWeight: '800', color: c.ink },
    sub: { fontSize: 12, color: c.muted, marginTop: 2 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    about: { textAlign: 'center', color: c.placeholder, fontSize: 11, marginTop: 14 },
  });

export default function SettingsScreen() {
  const s = useStyles(makeStyles);
  const { colors, preference, setPreference } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { resetDemo } = useData();
  const { confirm, toast } = useFeedback();
  const { back } = useRouter();
  const [prefs, setPrefs] = useState({ push: true, weekly: false });

  useEffect(() => { loadJSON(KEYS.prefs, null).then((p) => p && setPrefs(p)); }, []);
  const toggle = (key) => (value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    saveJSON(KEYS.prefs, next);
  };

  const reset = async () => {
    const ok = await confirm({ title: t('settings.resetAsk'), body: t('settings.resetBody'), confirmLabel: t('settings.reset'), danger: true });
    if (ok) { resetDemo(); toast(t('settings.resetDone')); }
  };

  const switchProps = { trackColor: { false: colors.line, true: colors.green2 }, thumbColor: '#fff' };

  return (
    <Screen>
      <Header title={t('settings.title')} onBack={back} />

      <Text style={s.group}>{t('settings.appearance').toUpperCase()}</Text>
      <Card style={s.card}>
        <View>
          <Text style={[s.label, { marginBottom: 10 }]}>{t('settings.theme')}</Text>
          <Segmented
            value={preference}
            onChange={setPreference}
            options={[
              { value: 'light', label: t('settings.light'), icon: 'sunny-outline' },
              { value: 'dark', label: t('settings.dark'), icon: 'moon-outline' },
              { value: 'system', label: t('settings.system'), icon: 'phone-portrait-outline' },
            ]}
          />
        </View>
        <View>
          <Text style={[s.label, { marginBottom: 10 }]}>{t('settings.language')}</Text>
          <Segmented
            value={lang}
            onChange={setLang}
            options={[
              { value: 'es', label: t('settings.spanish'), icon: 'language-outline' },
              { value: 'en', label: t('settings.english'), icon: 'language-outline' },
            ]}
          />
        </View>
      </Card>

      <Text style={s.group}>{t('settings.notifications').toUpperCase()}</Text>
      <Card style={s.card}>
        <View style={s.toggleRow}>
          <View style={{ flex: 1 }}><Text style={s.label}>{t('settings.push')}</Text><Text style={s.sub}>{t('settings.pushBody')}</Text></View>
          <Switch value={prefs.push} onValueChange={toggle('push')} {...switchProps} />
        </View>
        <View style={s.toggleRow}>
          <View style={{ flex: 1 }}><Text style={s.label}>{t('settings.sound')}</Text><Text style={s.sub}>{t('settings.soundBody')}</Text></View>
          <Switch value={prefs.weekly} onValueChange={toggle('weekly')} {...switchProps} />
        </View>
      </Card>

      <Text style={s.group}>{t('settings.about').toUpperCase()}</Text>
      <Button variant="secondary" icon="refresh-outline" label={t('settings.reset')} onPress={reset} />
      <Text style={s.about}>{t('profile.version')}</Text>
    </Screen>
  );
}
