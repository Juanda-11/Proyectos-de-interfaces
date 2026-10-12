import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { STAGES } from '../services/donations';
import { Icon } from './ui';

const STAGE_ICONS = { available: 'megaphone-outline', reserved: 'bookmark-outline', onTheWay: 'bicycle-outline', collected: 'checkmark-done-outline' };
export const stageIcon = (stage) => STAGE_ICONS[stage];

const makeStyles = (c) =>
  StyleSheet.create({
    wrap: { height: 78, marginBottom: 6 },
    track: { position: 'absolute', top: 19, left: '12.5%', right: '12.5%', height: 4, borderRadius: 2, backgroundColor: c.line, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: c.green2, borderRadius: 2 },
    row: { flexDirection: 'row' },
    col: { flex: 1, alignItems: 'center' },
    node: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt, borderWidth: 2, borderColor: c.line },
    nodeDone: { backgroundColor: c.primary, borderColor: c.primary },
    nodeCurrent: { backgroundColor: c.surface, borderColor: c.primary },
    nodeSelected: { transform: [{ scale: 1.12 }] },
    label: { fontSize: 11, fontWeight: '700', color: c.muted, marginTop: 7, textAlign: 'center' },
    labelActive: { color: c.ink },
    halo: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: c.green2 },
  });

// Barra de etapas animada. Solo las etapas completadas o actuales se pueden abrir.
export function StageProgress({ currentIndex, selectedIndex, onSelect, cancelled }) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: currentIndex / (STAGES.length - 1), duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [currentIndex, progress]);

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={s.wrap}>
      <View style={s.track}>
        <Animated.View style={[s.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
      <View style={s.row}>
        {STAGES.map((stage, i) => {
          const done = i < currentIndex || (i === currentIndex && stage === 'collected' && !cancelled);
          const current = i === currentIndex && !done && !cancelled;
          const locked = i > currentIndex;
          return (
            <Pressable key={stage} disabled={locked} onPress={() => onSelect(i)} style={s.col} accessibilityRole="button" accessibilityState={{ disabled: locked, selected: selectedIndex === i }} accessibilityLabel={t(`tracking.s_${stage}`)}>
              {current ? (
                <Animated.View style={[s.halo, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }] }]} />
              ) : null}
              <View style={[s.node, done && s.nodeDone, current && s.nodeCurrent, selectedIndex === i && s.nodeSelected]}>
                {done ? <Icon name="checkmark" size={21} color="#fff" /> : locked ? <Icon name="lock-closed-outline" size={17} color={colors.muted} /> : <Icon name={STAGE_ICONS[stage]} size={19} color={colors.accent} />}
              </View>
              <Text style={[s.label, !locked && s.labelActive]} numberOfLines={1}>{t(`tracking.s_${stage}`)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Versión compacta para las tarjetas de la lista.
export function MiniProgress({ currentIndex, cancelled }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
      {STAGES.map((st, i) => (
        <View key={st} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: cancelled ? colors.redSoft : i <= currentIndex ? colors.green2 : colors.line }} />
      ))}
    </View>
  );
}
