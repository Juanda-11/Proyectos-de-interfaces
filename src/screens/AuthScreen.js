import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../services/auth';
import { API_BASE } from '../services/config';
import { Button, Field, Icon, Segmented } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.bg },
    hero: { paddingTop: 54, paddingBottom: 56, paddingHorizontal: 24, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' },
    brandText: { color: '#fff', fontSize: 22, fontWeight: '900' },
    tools: { flexDirection: 'row', gap: 8 },
    toolBtn: { height: 38, minWidth: 38, paddingHorizontal: 10, borderRadius: 13, backgroundColor: 'rgba(255,255,255,.14)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
    toolText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 30, lineHeight: 35 },
    body: { color: c.onHeroMuted, fontSize: 14, lineHeight: 21, marginTop: 8 },
    card: { marginTop: -30, marginHorizontal: 20, backgroundColor: c.surface, borderRadius: 26, borderWidth: 1, borderColor: c.line, padding: 20, shadowColor: c.shadow, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
    sectionLabel: { fontSize: 12, fontWeight: '800', color: c.muted, marginBottom: 8, letterSpacing: 0.3 },
    roleHint: { color: c.muted, fontSize: 12, marginTop: 8, marginBottom: 18 },
    error: { backgroundColor: c.redSoft, borderRadius: 13, padding: 12, marginBottom: 14, flexDirection: 'row', gap: 8, alignItems: 'center' },
    errorText: { color: c.red, fontWeight: '700', fontSize: 13, flex: 1 },
    switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 18 },
    muted: { color: c.muted, fontSize: 13 },
    link: { color: c.accent, fontWeight: '800', fontSize: 13 },
    demo: { marginHorizontal: 20, marginTop: 18 },
    demoTitle: { color: c.muted, fontSize: 12, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
    demoRow: { flexDirection: 'row', gap: 10 },
    terms: { textAlign: 'center', color: c.placeholder, fontSize: 11, marginTop: 22, marginBottom: 30, paddingHorizontal: 30 },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthScreen() {
  const s = useStyles(makeStyles);
  const { colors, mode, toggle } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { signIn, signUp } = useAuth();

  const [mode_, setMode] = useState('login'); // login | register
  const [role, setRole] = useState('receiver');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError('');
  };

  const roles = useMemo(
    () => [
      { value: 'receiver', label: t('role.receiver'), icon: 'hand-left-outline' },
      { value: 'donor', label: t('role.donor'), icon: 'gift-outline' },
    ],
    [t]
  );
  const roleName = t(role === 'donor' ? 'role.donorLong' : 'role.receiverLong').toLowerCase();

  const validate = () => {
    const e = {};
    if (mode_ === 'register' && !form.name.trim()) e.name = t('auth.errName');
    if (!EMAIL_RE.test(form.email.trim())) e.email = t('auth.errInvalidEmail');
    if (form.password.length < 6) e.password = t('auth.errShortPassword');
    if (mode_ === 'register' && form.confirm !== form.password) e.confirm = t('auth.errMismatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const run = async (action) => {
    setBusy(true);
    setFormError('');
    try {
      await action();
    } catch (err) {
      const roleName = (r) => t(r === 'donor' ? 'role.donorLong' : 'role.receiverLong').toLowerCase();
      const map = {
        email_taken: t('auth.errExists'),
        invalid_credentials: t('auth.errCredentials'),
        role_mismatch: t('auth.errRole', { role: roleName(err.details && err.details.role) }),
        network: t('errors.network'),
        timeout: t('errors.network'),
        backend_not_configured: t('errors.backend'),
        bad_response: t('errors.backend'),
        rate_limited: t('errors.rateLimited'),
        storage_not_configured: t('errors.storage'),
      };
      // Línea técnica para diagnosticar despliegues (URL del backend y estado HTTP).
      const tech = ['network', 'timeout', 'backend_not_configured', 'bad_response'].includes(err.code)
        ? ` [${err.code}${err.status ? ` ${err.status}` : ''} · ${API_BASE || 'EXPO_PUBLIC_API_URL vacía'}]`
        : '';
      setFormError((map[err.code] || t('auth.errGeneric')) + tech);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!validate()) return;
    run(() =>
      mode_ === 'login'
        ? signIn({ email: form.email, password: form.password, role })
        : signUp({ name: form.name, email: form.email, password: form.password, role })
    );
  };

  const demo = (r) => run(() => signIn({ ...DEMO_ACCOUNTS[r], role: r }));

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.flex} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.heroFrom, colors.heroTo]} style={s.hero}>
          <View style={s.topRow}>
            <View style={s.brand}>
              <View style={s.logo}><Icon name="leaf" size={24} color="#0D3D29" /></View>
              <Text style={s.brandText}>FoodLink</Text>
            </View>
            <View style={s.tools}>
              <Pressable accessibilityRole="button" accessibilityLabel="language" onPress={() => setLang(lang === 'es' ? 'en' : 'es')} style={s.toolBtn}>
                <Icon name="language-outline" size={17} color="#fff" />
                <Text style={s.toolText}>{lang.toUpperCase()}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="theme" onPress={toggle} style={s.toolBtn}>
                <Icon name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
          <Text style={s.title}>{t('auth.welcome')}</Text>
          <Text style={s.body}>{t('auth.welcomeBody')}</Text>
        </LinearGradient>

        <View style={s.card}>
          <Text style={s.sectionLabel}>{(mode_ === 'login' ? t('auth.signInAs') : t('auth.iAm')).toUpperCase()}</Text>
          <Segmented options={roles} value={role} onChange={setRole} />
          <Text style={s.roleHint}>
            {mode_ === 'login'
              ? t(role === 'donor' ? 'role.donorDesc' : 'role.receiverDesc')
              : t('auth.registerAs', { role: roleName })}
          </Text>

          {mode_ === 'register' ? (
            <Field label={t('auth.name')} icon="person-outline" value={form.name} onChangeText={set('name')} error={errors.name} autoCapitalize="words" textContentType="name" />
          ) : null}
          <Field label={t('auth.email')} icon="mail-outline" value={form.email} onChangeText={set('email')} error={errors.email} placeholder={t('auth.emailPh')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" />
          <Field label={t('auth.password')} icon="lock-closed-outline" secure value={form.password} onChangeText={set('password')} error={errors.password} placeholder={t('auth.passwordPh')} autoCapitalize="none" textContentType={mode_ === 'login' ? 'password' : 'newPassword'} onSubmitEditing={mode_ === 'login' ? submit : undefined} />
          {mode_ === 'register' ? (
            <Field label={t('auth.confirmPassword')} icon="lock-closed-outline" secure value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} autoCapitalize="none" onSubmitEditing={submit} />
          ) : null}

          {formError ? (
            <View style={s.error} accessibilityRole="alert">
              <Icon name="alert-circle-outline" size={18} color={colors.red} />
              <Text style={s.errorText}>{formError}</Text>
            </View>
          ) : null}

          <Button label={mode_ === 'login' ? t('auth.signIn') : t('auth.signUp')} icon={mode_ === 'login' ? 'log-in-outline' : 'person-add-outline'} onPress={submit} loading={busy} />

          <View style={s.switchRow}>
            <Text style={s.muted}>{mode_ === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { setMode(mode_ === 'login' ? 'register' : 'login'); setErrors({}); setFormError(''); }}
            >
              <Text style={s.link}>{mode_ === 'login' ? t('auth.signUp') : t('auth.signIn')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={s.demo}>
          <Text style={s.demoTitle}>{t('auth.demoTitle').toUpperCase()}</Text>
          <View style={s.demoRow}>
            <Button style={{ flex: 1 }} small variant="secondary" icon="hand-left-outline" label={t('auth.demoReceiver')} onPress={() => demo('receiver')} />
            <Button style={{ flex: 1 }} small variant="secondary" icon="gift-outline" label={t('auth.demoDonor')} onPress={() => demo('donor')} />
          </View>
        </View>
        <Text style={s.terms}>{t('auth.terms')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
