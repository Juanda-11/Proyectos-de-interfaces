import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme/ThemeContext';

export function Icon({ name, size = 22, color }) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={color || colors.ink} />;
}
