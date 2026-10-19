import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles } from '../../theme/ThemeContext';
import { Icon } from './Icon';

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
