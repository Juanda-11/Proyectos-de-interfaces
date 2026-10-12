import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStyles, useTheme } from '../theme/ThemeContext';

export function Icon({ name, size = 22, color }) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={color || colors.ink} />;
}

// ---------- Pill ----------
export function Pill({ children, tone = 'green', icon, style }) {
  const { colors: c } = useTheme();
  const map = {
    green: [c.mint, c.accent],
    orange: [c.orangeSoft, c.orangeText],
    red: [c.redSoft, c.red],
    purple: [c.purpleSoft, c.purple],
    blue: [c.blueSoft, c.blue],
    neutral: [c.surfaceAlt, c.muted],
    light: ['rgba(255,255,255,.92)', '#0D3D29'],
    lime: [c.lime, '#0D3D29'],
  };
  const [bg, fg] = map[tone] || map.green;
  return (
    <View style={[pillStyle.base, { backgroundColor: bg }, style]}>
      {icon ? <Icon name={icon} size={13} color={fg} /> : null}
      <Text style={[pillStyle.text, { color: fg }]}>{children}</Text>
    </View>
  );
}
const pillStyle = StyleSheet.create({
  base: { alignSelf: 'flex-start', minHeight: 24, borderRadius: 20, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontSize: 11, fontWeight: '800' },
});

export const STATUS_TONE = { available: 'green', reserved: 'orange', onTheWay: 'purple', collected: 'blue', cancelled: 'red' };

// ---------- Buttons ----------
const makeButtonStyles = (c) =>
  StyleSheet.create({
    base: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 18 },
    primary: { backgroundColor: c.primary },
    secondary: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: c.redSoft },
    lime: { backgroundColor: c.lime },
    small: { minHeight: 42, borderRadius: 13 },
    disabled: { opacity: 0.5 },
    text: { fontWeight: '800', fontSize: 15 },
    textPrimary: { color: c.onPrimary },
    textSecondary: { color: c.accent },
    textDanger: { color: c.red },
    textLime: { color: '#0D3D29' },
  });

export function Button({ label, onPress, icon, variant = 'primary', small, loading, disabled, style, testID }) {
  const s = useStyles(makeButtonStyles);
  const { colors } = useTheme();
  const textStyle = { primary: s.textPrimary, secondary: s.textSecondary, ghost: s.textSecondary, danger: s.textDanger, lime: s.textLime }[variant];
  const iconColor = { primary: colors.onPrimary, secondary: colors.accent, ghost: colors.accent, danger: colors.red, lime: '#0D3D29' }[variant];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [s.base, s[variant], small && s.small, (disabled || loading) && s.disabled, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }, style]}
    >
      {loading ? <ActivityIndicator color={iconColor} /> : icon ? <Icon name={icon} size={small ? 17 : 19} color={iconColor} /> : null}
      <Text style={[s.text, textStyle, small && { fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

// ---------- Header ----------
const makeHeaderStyles = (c) =>
  StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 10 },
    title: { fontSize: 28, fontWeight: '800', color: c.ink },
    subtitle: { fontSize: 13, color: c.muted, marginTop: 3 },
    iconBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.line },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.orange, position: 'absolute', top: 9, right: 10, borderWidth: 1.5, borderColor: c.surface },
    actions: { flexDirection: 'row', gap: 8 },
  });

export function IconButton({ name, onPress, label, dot, color }) {
  const s = useStyles(makeHeaderStyles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}>
      <Icon name={name} size={21} color={color} />
      {dot ? <View style={s.dot} /> : null}
    </Pressable>
  );
}

export function Header({ title, subtitle, right, onBack }) {
  const s = useStyles(makeHeaderStyles);
  return (
    <View style={s.row}>
      {onBack ? <IconButton name="arrow-back" onPress={onBack} label="back" /> : null}
      <View style={{ flex: 1 }}>
        <Text style={s.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={s.actions}>{right}</View> : null}
    </View>
  );
}

// ---------- SectionTitle ----------
const makeSectionStyles = (c) =>
  StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
    title: { fontSize: 19, fontWeight: '800', color: c.ink },
    link: { fontSize: 13, color: c.accent, fontWeight: '800' },
  });
export function SectionTitle({ title, action, onAction }) {
  const s = useStyles(makeSectionStyles);
  return (
    <View style={s.row}>
      <Text style={s.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------- Card ----------
const makeCardStyles = (c) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.line, padding: 16 },
  });
export function Card({ children, style, onPress }) {
  const s = useStyles(makeCardStyles);
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.8 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

// ---------- Field ----------
const makeFieldStyles = (c) =>
  StyleSheet.create({
    wrap: { marginBottom: 14 },
    label: { fontSize: 12, fontWeight: '800', color: c.muted, marginBottom: 7, letterSpacing: 0.3 },
    box: { minHeight: 52, borderRadius: 15, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
    boxFocus: { borderColor: c.primary },
    boxError: { borderColor: c.red },
    input: { flex: 1, color: c.ink, fontSize: 15, paddingVertical: Platform.OS === 'web' ? 12 : 10, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : null) },
    multi: { minHeight: 84, alignItems: 'flex-start', paddingTop: 10 },
    error: { color: c.red, fontSize: 12, marginTop: 6, fontWeight: '600' },
  });

export function Field({ label, icon, error, secure, multiline, style, ...props }) {
  const s = useStyles(makeFieldStyles);
  const { colors } = useTheme();
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[s.wrap, style]}>
      {label ? <Text style={s.label}>{label.toUpperCase()}</Text> : null}
      <View style={[s.box, multiline && s.multi, focus && s.boxFocus, !!error && s.boxError]}>
        {icon ? <Icon name={icon} size={19} color={focus ? colors.accent : colors.muted} /> : null}
        <TextInput
          {...props}
          multiline={multiline}
          secureTextEntry={hidden}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholderTextColor={colors.placeholder}
          style={[s.input, multiline && { textAlignVertical: 'top', minHeight: 64 }]}
          accessibilityLabel={label}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="toggle password">
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

// ---------- Segmented control ----------
const makeSegStyles = (c) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', backgroundColor: c.surfaceAlt, borderRadius: 15, padding: 4, gap: 4 },
    item: { flex: 1, minHeight: 42, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 6 },
    active: { backgroundColor: c.primary },
    text: { fontSize: 13, fontWeight: '800', color: c.muted },
    textActive: { color: c.onPrimary },
  });
export function Segmented({ options, value, onChange }) {
  const s = useStyles(makeSegStyles);
  const { colors } = useTheme();
  return (
    <View style={s.wrap} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(o.value)} style={[s.item, active && s.active]}>
            {o.icon ? <Icon name={o.icon} size={17} color={active ? colors.onPrimary : colors.muted} /> : null}
            <Text style={[s.text, active && s.textActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Avatar ----------
export function Avatar({ name = '?', size = 44, radius, onPress }) {
  const { colors } = useTheme();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  const body = (
    <View style={{ width: size, height: size, borderRadius: radius ?? size * 0.34, backgroundColor: colors.heroFrom, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button">{body}</Pressable> : body;
}

// ---------- Screen wrapper (scroll + fade-in) ----------
export function Screen({ children, padded = true, contentStyle }) {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);
  return (
    <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
      <ScrollView
        contentContainerStyle={[padded && { padding: 20, paddingBottom: 32 }, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

// ---------- Empty state ----------
export function EmptyState({ icon = 'leaf-outline', text, action, onAction }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 28, gap: 12 }}>
      <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 14, lineHeight: 20, maxWidth: 280 }}>{text}</Text>
      {action ? <Button small variant="secondary" label={action} onPress={onAction} /> : null}
    </View>
  );
}
