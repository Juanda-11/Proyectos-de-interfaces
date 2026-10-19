import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles } from '../../theme/ThemeContext';

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
