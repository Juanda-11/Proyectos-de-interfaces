import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import { Icon } from './Icon';

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
