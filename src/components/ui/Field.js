import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import { Icon } from './Icon';

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
