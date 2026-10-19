import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView } from 'react-native';

export function Screen({ children, padded = true, contentStyle }) {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [fade, lift]);
  return (
    <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: lift }] }}>
      <ScrollView
        contentContainerStyle={[padded && { padding: 20, paddingBottom: 32 }, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}
