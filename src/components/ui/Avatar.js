import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

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
