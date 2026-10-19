import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles } from '../../theme/ThemeContext';

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
