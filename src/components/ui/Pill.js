import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Icon } from './Icon';

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
