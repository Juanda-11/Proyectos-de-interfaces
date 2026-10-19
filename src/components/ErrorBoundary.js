import React from 'react';
import { Pressable, Text, View } from 'react-native';

// Evita la pantalla en blanco si algo falla al dibujar: muestra un aviso y permite reintentar.
// No usa el tema ni i18n a propósito (podrían ser la causa del fallo).
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#F7F8F5' }}>
        <Text style={{ fontSize: 40 }}>🌱</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#17231D', marginTop: 12, textAlign: 'center' }}>
          Something went wrong · Algo salió mal
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ failed: false })}
          style={{ marginTop: 18, paddingHorizontal: 22, height: 46, borderRadius: 14, backgroundColor: '#177245', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Retry · Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}
