import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from './Button';
import { Icon } from './Icon';

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
