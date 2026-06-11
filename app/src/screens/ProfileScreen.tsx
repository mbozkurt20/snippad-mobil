import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, User, Mail, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';
import { useT } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'Profile'> };

export default function ProfileScreen({ navigation }: Props) {
  const T = useT();
  const { userSettings, updateProfile } = useAppStore();
  const { showAlert, alertElement } = useAlert();
  const [name, setName] = useState(userSettings.profile.name);
  const [email, setEmail] = useState(userSettings.profile.email);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(userSettings.profile.avatarUri);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = name !== userSettings.profile.name
    || email !== userSettings.profile.email
    || avatarUri !== userSettings.profile.avatarUri;

  const initials = (userSettings.profile.name || userSettings.profile.email || '?')
    .split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({ title: T.photoPermTitle, message: T.photoPermMsg, buttons: [{ text: T.ok, style: 'default' }] });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setAvatarUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert({ title: T.error, message: T.nameRequiredMsg, buttons: [{ text: T.ok, style: 'default' }] });
      return;
    }
    setSaving(true);
    try {
      await updateProfile(name.trim(), email.trim(), avatarUri);
      setSaved(true);
      setTimeout(() => { setSaved(false); navigation.goBack(); }, 800);
    } catch {
      showAlert({ title: T.error, message: T.profileUpdateFailed, buttons: [{ text: T.ok, style: 'default' }] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {alertElement}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{T.profileEdit}</Text>
          <TouchableOpacity
            onPress={handleSave} disabled={!isDirty || saving}
            style={[styles.saveBtn, (!isDirty || saving) && styles.saveBtnDisabled]}>
            {saved ? <Check size={18} color={Colors.white} /> : <Text style={styles.saveBtnText}>{saving ? '...' : T.save}</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto} activeOpacity={0.8}>
              {avatarUri
                ? <Image source={{ uri: avatarUri }} style={styles.avatar} />
                : <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>}
              <View style={styles.cameraBtn}>
                <Camera size={14} color={Colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>{T.changePhoto}</Text>
          </View>

          {/* Fields */}
          <View style={styles.fieldsCard}>
            <Text style={styles.sectionLabel}>{T.personalInfo}</Text>

            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}><User size={16} color={Colors.textGray} /></View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{T.nameSurname}</Text>
                <TextInput
                  style={styles.fieldInput} value={name} onChangeText={setName}
                  placeholder={T.namePlaceholder} placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.fieldRow}>
              <View style={styles.fieldIcon}><Mail size={16} color={Colors.textGray} /></View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{T.emailLabel}</Text>
                <TextInput
                  style={styles.fieldInput} value={email} onChangeText={setEmail}
                  placeholder={T.emailPlaceholder} placeholderTextColor={Colors.textLight}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...Typography.h3, color: Colors.textDark },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    minWidth: 72, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.35 },
  saveBtnText: { ...Typography.label, color: Colors.white, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarWrap: { position: 'relative', marginBottom: Spacing.sm },
  avatar: {
    width: 96, height: 96, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: Colors.white },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: BorderRadius.full,
    backgroundColor: Colors.textDark, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  avatarHint: { ...Typography.caption, color: Colors.primary },
  fieldsCard: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  sectionLabel: { ...Typography.label, color: Colors.textLight, letterSpacing: 1, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  fieldIcon: {
    width: 34, height: 34, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  fieldContent: { flex: 1 },
  fieldLabel: { ...Typography.label, color: Colors.textGray, marginBottom: 2 },
  fieldInput: { ...Typography.body, color: Colors.textDark, padding: 0 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 50 },
});
