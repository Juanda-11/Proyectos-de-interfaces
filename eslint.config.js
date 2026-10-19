const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  { ignores: ['dist/*', 'node_modules/*', '.expo/*'] },
  {
    rules: {
      // Falso positivo habitual con Animated.Value guardado en useRef (patrón estándar de React Native).
      'react-hooks/refs': 'off',
      // Marca como error cargas de datos asíncronas legítimas (fetch dentro de efectos).
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
