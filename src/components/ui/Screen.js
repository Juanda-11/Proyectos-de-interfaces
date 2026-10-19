import React, { useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView } from 'react-native';

// onRefresh (opcional): activa "tirar para actualizar" en el móvil.
export function Screen({ children, padded = true, contentStyle, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
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
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} /> : undefined}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}
