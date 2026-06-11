import React, { useRef, useEffect } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useLogger } from '../utils/logger';

import OnboardingFlowScreen from '../screens/OnboardingFlowScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import KeyboardPreviewScreen from '../screens/KeyboardPreviewScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import TeamScreen from '../screens/TeamScreen';
import BusinessImportScreen from '../screens/BusinessImportScreen';
import SignatureManager from '../screens/SignatureManager';
import SignatureDrawer from '../screens/SignatureDrawer';
import TeamInviteScreen from '../screens/TeamInviteScreen';
import SectorPacksScreen from '../screens/SectorPacksScreen';
import ReferralProgramScreen from '../screens/ReferralProgramScreen';
import EmailPreferencesScreen from '../screens/EmailPreferencesScreen';
import DeletedCategoriesScreen from '../screens/DeletedCategoriesScreen';
import WebSignInScreen from '../screens/WebSignInScreen';
import TemplateManagerScreen from '../screens/TemplateManagerScreen';
import { useAppStore } from '../store/useAppStore';
import { mmkvStorage } from '../store/storage';
import { useT } from '../i18n';
import { Colors, BorderRadius } from '../theme';

// Trial bitti → PaywallScreen'i root stack'te göster (tip köprüsü)
function TrialPaywallBridge({ navigation }: { navigation: any }) {
  return <PaywallScreen navigation={navigation as any} />;
}
import type {
  RootStackParamList,
  MainTabParamList,
  DashboardStackParamList,
  SettingsStackParamList,
} from '../types';

const Root = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashStack = createNativeStackNavigator<DashboardStackParamList>();
const SettStack = createNativeStackNavigator<SettingsStackParamList>();

function DashboardStack() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashStack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
    </DashStack.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettStack.Navigator screenOptions={{ headerShown: false }}>
      <SettStack.Screen name="SettingsHome" component={SettingsScreen} />
      <SettStack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
      <SettStack.Screen name="Profile" component={ProfileScreen} />
      <SettStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <SettStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <SettStack.Screen name="KeyboardPreview" component={KeyboardPreviewScreen} />
      <SettStack.Screen name="Permissions" component={PermissionsScreen} />
      <SettStack.Screen name="Team" component={TeamScreen} />
      <SettStack.Screen name="BusinessImport" component={BusinessImportScreen} />
      <SettStack.Screen name="SignatureManager" component={SignatureManager} />
      <SettStack.Screen name="SignatureDrawer" component={SignatureDrawer} />
      <SettStack.Screen name="SectorPacks" component={SectorPacksScreen} />
      <SettStack.Screen name="ReferralProgram" component={ReferralProgramScreen} />
      <SettStack.Screen name="EmailPreferences" component={EmailPreferencesScreen} />
      <SettStack.Screen name="DeletedCategories" component={DeletedCategoriesScreen} />
      <SettStack.Screen name="WebSignIn" component={WebSignInScreen} />
      <SettStack.Screen name="TemplateManager" component={TemplateManagerScreen} />
    </SettStack.Navigator>
  );
}

function MainTabs() {
  const T = useT();
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0) + 8;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarBackground: () => (
          <BlurView intensity={95} style={StyleSheet.absoluteFill}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.96)' }} />
          </BlurView>
        ),
        tabBarStyle: [styles.tabBar, { bottom: tabBarBottom, backgroundColor: 'transparent' }],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color }) =>
          route.name === 'Dashboard'
            ? <LayoutDashboard size={22} color={color} />
            : <Settings size={22} color={color} />,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: T.tabTemplates }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ tabBarLabel: T.tabSettings }} />
    </Tab.Navigator>
  );
}

const LINKING = {
  prefixes: ['asistanklavye://'],
  config: {
    screens: {
      TeamInvite: { path: 'invite', parse: { token: (t: string) => t } },
      Login: { path: 'referral', parse: {
        ref: (code: string) => {
          // Referral kodu deep link'ten gelince storage'a yaz, kayıt formunda kullanılacak
          if (code) mmkvStorage.setPendingReferralCode(code);
          return code;
        },
      }},
    },
  },
};

export default function AppNavigator() {
  const isOnboarded    = useAppStore(s => s.isOnboarded);
  const isLoggedIn     = useAppStore(s => s.userSettings.is_logged_in);
  const isPremium      = useAppStore(s => s.userSettings.is_premium);
  const getTrialState  = useAppStore(s => s.getTrialState);

  const trialState  = getTrialState();
  // locked → tam kilit (Paywall ekranı), diğerleri Main'e erişebilir
  const showPaywall = isOnboarded && isLoggedIn && trialState === 'locked';
  const showMain    = isOnboarded && isLoggedIn && trialState !== 'locked';

  const navigationRef = useRef<any>(null);
  const { addLog } = useLogger();

  const handleNavigationStateChange = (state: NavigationState | undefined) => {
    if (state) {
      const getRouteName = (state: NavigationState): string => {
        const route = state.routes[state.index];
        if (route.state) {
          return getRouteName(route.state as NavigationState);
        }
        return route.name;
      };
      const currentRoute = getRouteName(state);
      addLog('nav', `Navigated to: ${currentRoute}`);
    }
  };

  return (
    <NavigationContainer
      linking={LINKING}
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
    >
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {showPaywall ? (
          <>
            <Root.Screen name="Paywall" component={TrialPaywallBridge} />
            <Root.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
            <Root.Screen name="TeamInvite" component={TeamInviteScreen} options={{ presentation: 'modal' }} />
          </>
        ) : showMain ? (
          <>
            <Root.Screen name="Main" component={MainTabs} />
            <Root.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
            <Root.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ presentation: 'modal' }} />
            <Root.Screen name="TeamInvite" component={TeamInviteScreen} options={{ presentation: 'modal' }} />
          </>
        ) : (
          <>
            {!isOnboarded && (
              <Root.Screen name="Onboarding" component={OnboardingFlowScreen} />
            )}
            <Root.Screen name="Login" component={LoginScreen} />
            <Root.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ presentation: 'modal' }} />
            <Root.Screen name="TeamInvite" component={TeamInviteScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 16, left: 16, right: 16,
    borderRadius: 28,
    borderTopWidth: 0,
    height: 62,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 28,
    elevation: 10,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.1 },
});
