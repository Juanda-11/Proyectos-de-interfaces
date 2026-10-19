import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../../theme/ThemeContext';
import { Icon } from './Icon';

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
