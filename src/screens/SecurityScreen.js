import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../navigation/Router';
import { useFeedback } from '../components/Feedback';
import { Button, Field, Header, Icon, Screen, SectionTitle } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    privacy: { flexDirection: 'row', gap: 12, backgroundColor: c.mint, borderRadius: 20, padding: 16, marginBottom: 22 },
    title: { fontSize: 14, fontWeight: '800', color: c.ink },
    body: { fontSize: 13, color: c.muted, lineHeight: 19, marginTop: 4 },
  });

export default function SecurityScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { changePassword, removeAccount } = useAuth();
  const { toast, confirm } = useFeedback();
  const { back } = useRouter();
  const [form, setForm] = useState({ current: '', next: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setErrors({}); };

  const submit = async () => {
    if (form.next.length < 6) return setErrors({ next: t('auth.errShortPassword') });
    setBusy(true);
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '' });
      toast(t('security.done'));
    } catch {
      setErrors({ current: t('security.errCurrent') });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({ title: t('security.deleteAsk'), body: t('security.deleteBody'), confirmLabel: t('security.deleteAccount'), danger: true });
    if (ok) removeAccount();
  };

  return (
    <Screen>
      <Header title={t('security.title')} onBack={back} />
      <View style={s.privacy}>
        <Icon name="shield-checkmark-outline" size={24} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('security.privacyTitle')}</Text>
          <Text style={s.body}>{t('security.privacyBody')}</Text>
        </View>
      </View>
      <SectionTitle title={t('security.change')} />
      <Field label={t('security.current')} icon="lock-closed-outline" secure value={form.current} onChangeText={set('current')} error={errors.current} autoCapitalize="none" />
      <Field label={t('security.newPass')} icon="key-outline" secure value={form.next} onChangeText={set('next')} error={errors.next} placeholder={t('auth.passwordPh')} autoCapitalize="none" />
      <Button label={t('common.save')} icon="save-outline" onPress={submit} loading={busy} disabled={!form.current || !form.next} />
      <View style={{ height: 24 }} />
      <Button variant="danger" icon="trash-outline" label={t('security.deleteAccount')} onPress={remove} />
    </Screen>
  );
}
