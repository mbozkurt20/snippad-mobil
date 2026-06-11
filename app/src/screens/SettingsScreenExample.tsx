import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Settings, Bell, Lock, LogOut, Trash2 } from 'lucide-react-native';
import {
  ScreenContainer,
  ScreenHeader,
  SectionTitle,
  ListRow,
  Toggle,
  AppText,
  GhostButton,
} from '../components/ui';
import { colors, layout } from '../theme/theme';

export default function SettingsScreenExample() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    console.log('Logout tapped');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account tapped');
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader
        title="Ayarlar"
        onBack={() => console.log('Back tapped')}
      />

      {/* ACCOUNT SECTION */}
      <SectionTitle label="HESAP" />
      <ListRow
        icon={<Settings size={18} color={colors.primary} />}
        label="Profil"
        onPress={() => console.log('Profile tapped')}
      />
      <ListRow
        icon={<Bell size={18} color={colors.primary} />}
        label="Bildirimler"
        onPress={() => console.log('Notifications tapped')}
      />

      {/* KEYBOARD SECTION */}
      <SectionTitle label="KLAVYE" />
      <ListRow
        icon={<Settings size={18} color={colors.primary} />}
        label="Tema Seç"
        subtitle="Şu anki: Açık Tema"
        onPress={() => console.log('Theme tapped')}
      />
      <ListRow
        label="Bildirimleri Aç"
        rightElement={
          <Toggle
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        }
      />

      {/* DATA SECTION */}
      <SectionTitle label="VERİ" />
      <ListRow
        icon={<Lock size={18} color={colors.primary} />}
        label="Gizlilik"
        onPress={() => console.log('Privacy tapped')}
      />

      {/* SUPPORT SECTION */}
      <SectionTitle label="DESTEK" />
      <ListRow
        label="Hakkında"
        onPress={() => console.log('About tapped')}
      />
      <ListRow
        label="Yardım & Destek"
        onPress={() => console.log('Help tapped')}
      />

      {/* DANGER ZONE */}
      <SectionTitle label="Tehlikeli İşlemler" />
      <GhostButton
        label="Çıkış Yap"
        onPress={handleLogout}
        style={s.dangerButton}
      />
      <GhostButton
        label="Hesabı Sil"
        onPress={handleDeleteAccount}
        style={s.dangerButton}
      />

      {/* VERSION */}
      <View style={s.versionContainer}>
        <AppText variant="hint" color="textHint">
          Sürüm 1.0.0
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  dangerButton: {
    marginBottom: layout.gap.sm,
  },
  versionContainer: {
    marginTop: layout.gap.xxl,
    alignItems: 'center',
    paddingBottom: layout.gap.xl,
  },
});
