import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../navigation/Router';
import { useFeedback } from '../components/Feedback';
import { Avatar, Button, Field, Header, Screen } from '../components/ui';

export default function PersonalScreen() {
  const { t } = useI18n();
  const { user, update } = useAuth();
  const { toast } = useFeedback();
  const { back } = useRouter();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const save = async () => {
    if (!form.name.trim()) return setError(t('auth.errName'));
    setBusy(true);
    await update({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
    setBusy(false);
    toast(t('common.saved'));
    back();
  };

  return (
    <Screen>
      <Header title={t('personal.title')} onBack={back} />
      <View style={{ alignItems: 'center', marginBottom: 22 }}><Avatar name={form.name || user.name} size={84} radius={29} /></View>
      <Field label={t('personal.name')} icon="person-outline" value={form.name} onChangeText={set('name')} error={error} autoCapitalize="words" />
      <Field label={t('personal.email')} icon="mail-outline" value={user.email} editable={false} style={{ opacity: 0.6, marginBottom: 4 }} />
      <Text style={{ fontSize: 11, color: '#8a968f', marginBottom: 14 }}>{t('personal.emailLocked')}</Text>
      <Field label={t('personal.phone')} icon="call-outline" value={form.phone} onChangeText={set('phone')} placeholder={t('personal.phonePh')} keyboardType="phone-pad" />
      <Field label={t('personal.address')} icon="location-outline" value={form.address} onChangeText={set('address')} placeholder={t('personal.addressPh')} />
      <Field label={t('personal.role')} icon={user.role === 'donor' ? 'gift-outline' : 'hand-left-outline'} value={t(`profile.${user.role}`)} editable={false} style={{ opacity: 0.6 }} />
      <Button label={t('common.save')} icon="save-outline" onPress={save} loading={busy} />
    </Screen>
  );
}
