import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLocation } from '../context/LocationContext';
import { useRouter } from '../navigation/Router';
import { CATEGORIES } from '../services/donations';
import { AnalysisError, analyzeFood, makeThumbnail } from '../services/ai';
import { DEFAULT_LOCATION } from '../services/config';
import { Button, Card, Field, Header, Icon, Pill, Screen, Segmented } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    stepper: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
    stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    circleOn: { backgroundColor: c.primary },
    num: { fontSize: 12, fontWeight: '800', color: c.muted },
    numOn: { color: c.onPrimary },
    stepText: { fontSize: 12, color: c.muted, fontWeight: '700' },
    stepTextOn: { color: c.ink },
    line: { flex: 1, height: 2, backgroundColor: c.line, marginHorizontal: 8 },
    lineOn: { backgroundColor: c.green2 },
    scan: { alignItems: 'center', padding: 22 },
    scanIcon: { width: 128, height: 128, borderRadius: 32, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    scanTitle: { fontSize: 22, fontWeight: '800', color: c.ink },
    scanBody: { textAlign: 'center', fontSize: 13, lineHeight: 19, color: c.muted, marginTop: 8, marginBottom: 18, maxWidth: 300 },
    btns: { alignSelf: 'stretch', gap: 10 },
    tip: { fontSize: 12, color: c.muted, textAlign: 'center', marginTop: 14 },
    manual: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
    manualIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' },
    manualTitle: { fontSize: 14, fontWeight: '800', color: c.ink },
    manualBody: { fontSize: 12, color: c.muted, marginTop: 2 },
    error: { backgroundColor: c.redSoft, borderRadius: 18, padding: 14, marginBottom: 14, gap: 10 },
    errorTitle: { color: c.red, fontWeight: '800', fontSize: 14 },
    errorBody: { color: c.ink, fontSize: 13, lineHeight: 18 },
    errorRow: { flexDirection: 'row', gap: 8 },
    analyzing: { alignItems: 'center', padding: 24 },
    preview: { width: 180, height: 180, borderRadius: 28, marginBottom: 20, backgroundColor: c.surfaceAlt },
    previewWrap: { alignItems: 'center', justifyContent: 'center' },
    sparkle: { position: 'absolute', bottom: 8, right: -6, width: 44, height: 44, borderRadius: 22, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: c.surface },
    aiTitle: { fontSize: 19, fontWeight: '800', color: c.ink, textAlign: 'center' },
    aiBody: { color: c.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8 },
    track: { height: 6, backgroundColor: c.surfaceAlt, borderRadius: 4, width: '100%', marginTop: 22, overflow: 'hidden' },
    bar: { height: '100%', width: '40%', backgroundColor: c.green2, borderRadius: 4 },
    resultTop: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 },
    thumb: { width: 76, height: 76, borderRadius: 20, backgroundColor: c.mint },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    chip: { paddingHorizontal: 13, height: 36, borderRadius: 18, backgroundColor: c.surfaceAlt, justifyContent: 'center' },
    chipOn: { backgroundColor: c.primary },
    chipText: { fontSize: 13, fontWeight: '700', color: c.muted },
    chipTextOn: { color: c.onPrimary },
    label: { fontSize: 12, fontWeight: '800', color: c.muted, marginBottom: 7, letterSpacing: 0.3 },
    twoCol: { flexDirection: 'row', gap: 12 },
    info: { backgroundColor: c.mint, borderRadius: 16, padding: 13, flexDirection: 'row', gap: 10, marginBottom: 14 },
    infoText: { flex: 1, color: c.ink, fontSize: 13, lineHeight: 18 },
    warn: { backgroundColor: c.orangeSoft },
  });

const EMPTY = { title: '', category: 'other', qty: '', kg: '', shelfLifeDays: '1', freshness: 'good', address: '', notes: '' };

export default function PublishScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { publish } = useData();
  const loc = useLocation();
  const { go } = useRouter();

  const [stage, setStage] = useState('start'); // start | analyzing | form
  const [photo, setPhoto] = useState(null);
  const [form, setForm] = useState({ ...EMPTY, address: user.address || '' });
  const [meta, setMeta] = useState({ ai: false });
  const [error, setError] = useState(null); // { title, body, retry }
  const [titleError, setTitleError] = useState('');
  const [busy, setBusy] = useState(false);
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => { loc.request(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (stage !== 'analyzing') return undefined;
    const loop = Animated.loop(Animated.timing(bar, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [stage, bar]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const pick = async (source) => {
    setError(null);
    try {
      if (source === 'camera') {
        if (Platform.OS !== 'web') {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return setError({ title: t('publish.aiError'), body: t('publish.permCamera') });
        }
        const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!res.canceled) analyze(res.assets[0].uri);
      } else {
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!res.canceled) analyze(res.assets[0].uri);
      }
    } catch {
      setError({ title: t('publish.aiError'), body: t('publish.permPhotos') });
    }
  };

  const analyze = async (uri) => {
    setPhoto(uri);
    setStage('analyzing');
    try {
      const r = await analyzeFood(uri, lang);
      setForm({
        title: r.name || '',
        category: CATEGORIES.includes(r.category) ? r.category : 'other',
        qty: r.quantityText || '',
        kg: r.weightKg != null ? String(r.weightKg) : '',
        shelfLifeDays: String(r.shelfLifeDays ?? 1),
        freshness: ['good', 'fair', 'poor'].includes(r.freshness) ? r.freshness : 'good',
        address: user.address || '',
        notes: r.notes || '',
      });
      setMeta({ ai: true, confidence: r.confidence, storage: r.storage, allergens: r.allergens || [], safe: r.safeToDonate !== false });
      setStage('form');
    } catch (e) {
      const code = e instanceof AnalysisError ? e.code : 'failed';
      setStage('start');
      if (code === 'notFood') setError({ title: t('publish.aiError'), body: t('publish.notFood') });
      else if (code === 'unavailable') setError({ title: t('publish.aiError'), body: t('publish.aiUnavailable'), manual: true });
      else setError({ title: t('publish.aiError'), body: t('publish.aiErrorBody'), retry: uri, manual: true });
    }
  };

  const manual = () => { setError(null); setMeta({ ai: false }); setStage('form'); };

  const submit = async () => {
    if (!form.title.trim()) return setTitleError(t('publish.required'));
    setBusy(true);
    const thumb = photo ? await makeThumbnail(photo) : null;
    const base = loc.granted ? loc.coords : DEFAULT_LOCATION;
    const jitter = loc.granted ? 0 : (Math.random() - 0.5) * 0.012;
    const kg = parseFloat(String(form.kg).replace(',', '.'));
    const donation = publish(
      {
        title: form.title.trim(),
        category: form.category,
        qty: form.qty.trim() || '1',
        kg: Number.isFinite(kg) ? kg : 1,
        shelfLifeDays: parseInt(form.shelfLifeDays, 10) || 1,
        freshness: form.freshness,
        address: form.address.trim() || 'Pasto',
        notes: form.notes.trim(),
        lat: base.lat + jitter,
        lng: base.lng + jitter,
        ai: meta.ai,
        photo: thumb,
      },
      user
    );
    setBusy(false);
    go('published', { id: donation.id });
  };

  const active = stage === 'start' ? 0 : stage === 'analyzing' ? 1 : 2;
  const steps = [t('publish.stepFood'), t('publish.stepAi'), t('publish.stepPublish')];

  return (
    <Screen>
      <Header title={t('publish.title')} subtitle={t('publish.subtitle')} />
      <View style={s.stepper}>
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <View style={s.stepItem}>
              <View style={[s.circle, i <= active && s.circleOn]}>
                {i < active ? <Icon name="checkmark" size={15} color="#fff" /> : <Text style={[s.num, i <= active && s.numOn]}>{i + 1}</Text>}
              </View>
              <Text style={[s.stepText, i <= active && s.stepTextOn]}>{label}</Text>
            </View>
            {i < 2 ? <View style={[s.line, i < active && s.lineOn]} /> : null}
          </React.Fragment>
        ))}
      </View>

      {stage === 'start' ? (
        <>
          {error ? (
            <View style={s.error} accessibilityRole="alert">
              <Text style={s.errorTitle}>{error.title}</Text>
              <Text style={s.errorBody}>{error.body}</Text>
              <View style={s.errorRow}>
                {error.retry ? <Button small variant="secondary" icon="refresh-outline" label={t('common.retry')} onPress={() => analyze(error.retry)} style={{ flex: 1 }} /> : null}
                {error.manual ? <Button small variant="secondary" icon="create-outline" label={t('publish.manual')} onPress={manual} style={{ flex: 1 }} /> : null}
              </View>
            </View>
          ) : null}
          <Card style={s.scan}>
            <View style={s.scanIcon}><Icon name="scan-outline" size={58} color={colors.accent} /></View>
            <Text style={s.scanTitle}>{t('publish.scanTitle')}</Text>
            <Text style={s.scanBody}>{t('publish.scanBody')}</Text>
            <View style={s.btns}>
              <Button icon="camera-outline" label={t('publish.takePhoto')} onPress={() => pick('camera')} />
              <Button variant="secondary" icon="images-outline" label={t('publish.pickPhoto')} onPress={() => pick('library')} />
            </View>
            <Text style={s.tip}>{t('publish.photoTip')}</Text>
          </Card>
          <Card onPress={manual} style={s.manual}>
            <View style={s.manualIcon}><Icon name="create-outline" size={22} color={colors.accent} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.manualTitle}>{t('publish.manual')}</Text>
              <Text style={s.manualBody}>{t('publish.manualBody')}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={colors.chevron} />
          </Card>
        </>
      ) : null}

      {stage === 'analyzing' ? (
        <Card style={s.analyzing}>
          <View style={s.previewWrap}>
            {photo ? <Image source={{ uri: photo }} style={s.preview} /> : null}
            <View style={s.sparkle}><ActivityIndicator color="#fff" /></View>
          </View>
          <Text style={s.aiTitle}>{t('publish.analyzing')}</Text>
          <Text style={s.aiBody}>{t('publish.analyzingBody')}</Text>
          <View style={s.track}>
            <Animated.View style={[s.bar, { transform: [{ translateX: bar.interpolate({ inputRange: [0, 1], outputRange: [-120, 320] }) }] }]} />
          </View>
        </Card>
      ) : null}

      {stage === 'form' ? (
        <>
          <View style={s.resultTop}>
            {photo ? <Image source={{ uri: photo }} style={s.thumb} /> : <View style={[s.thumb, { alignItems: 'center', justifyContent: 'center' }]}><Icon name="create-outline" size={28} color={colors.accent} /></View>}
            <View style={{ flex: 1, gap: 8 }}>
              <Pill tone={meta.ai ? 'purple' : 'neutral'} icon={meta.ai ? 'sparkles-outline' : 'create-outline'}>{meta.ai ? t('publish.resultAi') : t('publish.resultManual')}</Pill>
              {meta.ai && meta.confidence != null ? <Text style={{ color: colors.muted, fontSize: 12 }}>{t('publish.confidence', { n: Math.round(meta.confidence * 100) })}</Text> : null}
              {photo ? <Pressable onPress={() => { setStage('start'); setPhoto(null); }}><Text style={{ color: colors.accent, fontWeight: '800', fontSize: 13 }}>{t('publish.retake')}</Text></Pressable> : null}
            </View>
          </View>

          {meta.ai && meta.safe === false ? (
            <View style={[s.info, s.warn]}>
              <Icon name="warning-outline" size={20} color={colors.orangeText} />
              <Text style={s.infoText}>{t('publish.notSafe')}</Text>
            </View>
          ) : (
            <View style={s.info}>
              <Icon name="information-circle-outline" size={20} color={colors.accent} />
              <Text style={s.infoText}>{t('publish.review')}</Text>
            </View>
          )}

          <Field label={t('publish.foodName')} icon="restaurant-outline" value={form.title} onChangeText={(v) => { set('title')(v); setTitleError(''); }} error={titleError} />

          <Text style={s.label}>{t('publish.category').toUpperCase()}</Text>
          <View style={s.chips}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} accessibilityRole="button" onPress={() => set('category')(c)} style={[s.chip, form.category === c && s.chipOn]}>
                <Text style={[s.chipText, form.category === c && s.chipTextOn]}>{t(`cat.${c}`)}</Text>
              </Pressable>
            ))}
          </View>

          <View style={s.twoCol}>
            <Field style={{ flex: 1 }} label={t('publish.quantity')} value={form.qty} onChangeText={set('qty')} placeholder="12 u." />
            <Field style={{ flex: 1 }} label={t('publish.weight')} value={form.kg} onChangeText={set('kg')} keyboardType="decimal-pad" placeholder="3" />
          </View>

          <Text style={s.label}>{t('publish.freshness').toUpperCase()}</Text>
          <View style={{ marginBottom: 14 }}>
            <Segmented value={form.freshness} onChange={set('freshness')} options={['good', 'fair', 'poor'].map((f) => ({ value: f, label: t(`publish.fresh_${f}`) }))} />
          </View>

          <Field label={t('publish.shelfLifeDays')} icon="time-outline" value={form.shelfLifeDays} onChangeText={set('shelfLifeDays')} keyboardType="number-pad" />
          <Field label={t('publish.pickup')} icon="location-outline" value={form.address} onChangeText={set('address')} placeholder={t('publish.pickupPh')} />
          <Field label={t('publish.notes')} icon="document-text-outline" value={form.notes} onChangeText={set('notes')} placeholder={t('publish.notesPh')} multiline />

          {meta.ai && (meta.storage || meta.allergens?.length) ? (
            <View style={[s.info, { backgroundColor: colors.purpleSoft }]}>
              <Icon name="sparkles-outline" size={20} color={colors.purple} />
              <View style={{ flex: 1, gap: 4 }}>
                {meta.storage ? <Text style={s.infoText}><Text style={{ fontWeight: '800' }}>{t('publish.storage')}: </Text>{meta.storage}</Text> : null}
                {meta.allergens?.length ? <Text style={s.infoText}><Text style={{ fontWeight: '800' }}>{t('publish.allergens')}: </Text>{meta.allergens.join(', ')}</Text> : null}
              </View>
            </View>
          ) : null}

          <Button label={t('publish.publishCta')} icon="paper-plane-outline" onPress={submit} loading={busy} />
        </>
      ) : null}
    </Screen>
  );
}
