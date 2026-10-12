import React from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { I18nProvider } from './src/i18n/I18nContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider, useData } from './src/context/DataContext';
import { LocationProvider } from './src/context/LocationContext';
import { FeedbackProvider } from './src/components/Feedback';
import { RouterProvider, useRouter } from './src/navigation/Router';
import { BottomNav } from './src/components/BottomNav';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import DetailScreen from './src/screens/DetailScreen';
import MapScreen from './src/screens/MapScreen';
import PublishScreen from './src/screens/PublishScreen';
import PublishedScreen from './src/screens/PublishedScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import ImpactScreen from './src/screens/ImpactScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PersonalScreen from './src/screens/PersonalScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import HelpScreen from './src/screens/HelpScreen';

const SCREENS = {
  home: HomeScreen,
  explore: ExploreScreen,
  detail: DetailScreen,
  map: MapScreen,
  publish: PublishScreen,
  published: PublishedScreen,
  activity: ActivityScreen,
  tracking: TrackingScreen,
  impact: ImpactScreen,
  notifications: NotificationsScreen,
  profile: ProfileScreen,
  settings: SettingsScreen,
  personal: PersonalScreen,
  security: SecurityScreen,
  help: HelpScreen,
};
const NO_NAV = ['published'];

function Routes() {
  const { screen } = useRouter();
  const Current = SCREENS[screen] || HomeScreen;
  return (
    <>
      <View style={{ flex: 1 }}>
        <Current />
      </View>
      {NO_NAV.includes(screen) ? null : <BottomNav />}
    </>
  );
}

function Root() {
  const { colors, mode } = useTheme();
  const { user, ready } = useAuth();
  const data = useData();

  let body;
  if (!ready || !data.ready) {
    body = (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  } else if (!user) {
    body = <AuthScreen />;
  } else {
    // key por usuario: al cambiar de cuenta la navegación vuelve al inicio.
    body = (
      <RouterProvider key={user.id}>
        <Routes />
      </RouterProvider>
    );
  }

  return (
    <View style={[styles.outer, { backgroundColor: colors.outer }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.shell, { backgroundColor: colors.bg }]}>{body}</SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <DataProvider>
            <LocationProvider>
              <FeedbackProvider>
                <Root />
              </FeedbackProvider>
            </LocationProvider>
          </DataProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center' },
  shell: { flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
