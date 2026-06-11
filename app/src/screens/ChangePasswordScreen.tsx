import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Eye, EyeOff, Check } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAlert } from '../components/CustomAlert';
import ScreenHeader from '../components/ScreenHeader';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'ChangePassword'> };

export default function ChangePasswordScreen({ navigation }: Props) {
  const T = useT();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const updatePassword = useAppStore(s => s.updatePassword);
  const { showAlert, alertElement } = useAlert();

  const hasUpper  = /[A-Z]/.test(next);
  const hasDigit  = /[0-9]/.test(next);
  const isValid   = current.length >= 6 && next.length >= 6 && hasUpper && hasDigit && next === confirm;
  const mismatch  = confirm.length > 0 && next !== confirm;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    const res = await updatePassword(current, next);
    setLoading(false);
    if (res === 'error') {
      showAlert({ title: T.error, message: T.currentPasswordError, buttons: [{ text: T.ok }] });
      return;
    }
    showAlert({
      title: T.passwordUpdated,
      message: T.passwordUpdatedDesc,
      buttons: [{ text: T.ok, onPress: () => navigation.goBack() }],
    });
  };

  const toggle = (field: keyof typeof show) =>
    setShow(s => ({ ...s, [field]: !s[field] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {alertElement}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader
          title={T.changePasswordTitle}
          onBack={() => navigation.goBack()}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.iconWrap}>
            <Lock size={40} color={Colors.primary} />
          </View>
          <Text style={styles.desc}>{T.changePasswordDesc}</Text>

          <View style={styles.fieldsCard}>
            <Text style={styles.sectionLabel}>{T.currentPasswordSection}</Text>
            <View style={[styles.field, !current && styles.fieldEmpty]}>
              <Lock size={18} color={Colors.textGray} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={T.currentPassword}
                placeholderTextColor={Colors.textLight}
                value={current} onChangeText={setCurrent}
                secureTextEntry={!show.current} autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => toggle('current')}>
                {show.current ? <EyeOff size={18} color={Colors.textLight} /> : <Eye size={18} color={Colors.textLight} />}
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>{T.newPasswordSection}</Text>
            <View style={styles.field}>
              <Lock size={18} color={Colors.textGray} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={T.newPassword}
                placeholderTextColor={Colors.textLight}
                value={next} onChangeText={setNext}
                secureTextEntry={!show.next} autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => toggle('next')}>
                {show.next ? <EyeOff size={18} color={Colors.textLight} /> : <Eye size={18} color={Colors.textLight} />}
              </TouchableOpacity>
            </View>

            <View style={[styles.field, mismatch && styles.fieldError]}>
              <Lock size={18} color={mismatch ? Colors.danger : Colors.textGray} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={T.confirmPassword}
                placeholderTextColor={Colors.textLight}
                value={confirm} onChangeText={setConfirm}
                secureTextEntry={!show.confirm} autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => toggle('confirm')}>
                {show.confirm ? <EyeOff size={18} color={Colors.textLight} /> : <Eye size={18} color={Colors.textLight} />}
              </TouchableOpacity>
            </View>
            {mismatch && <Text style={styles.errorText}>{T.passwordMismatch}</Text>}
          </View>

          <View style={styles.rules}>
            {[
              { ok: next.length >= 6, text: T.minSixChars },
              { ok: hasUpper, text: T.oneUppercase },
              { ok: hasDigit, text: T.oneNumber },
            ].map(rule => (
              <View key={rule.text} style={styles.ruleRow}>
                <View style={[styles.ruleDot, rule.ok && styles.ruleDotOk]}>
                  {rule.ok && <Check size={10} color={Colors.white} />}
                </View>
                <Text style={[styles.ruleText, rule.ok && styles.ruleTextOk]}>{rule.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid || loading}>
            <Text style={styles.saveBtnText}>
              {loading ? T.updating : T.updatePassword}
            </Text>
          </TouchableOpacity>
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
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...Typography.h3, color: Colors.textDark },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  iconWrap: {
    width: 80, height: 80, borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardLavender, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: Spacing.xl, marginBottom: Spacing.md,
  },
  desc: { ...Typography.body, color: Colors.textGray, textAlign: 'center', marginBottom: Spacing.xl },
  fieldsCard: {
    backgroundColor: Colors.cardLight, borderRadius: BorderRadius.lg,
    padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  sectionLabel: { ...Typography.label, color: Colors.textLight, letterSpacing: 0.8, marginBottom: 4 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, minHeight: 52,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  fieldEmpty: { borderColor: Colors.border },
  fieldError: { borderColor: Colors.danger },
  input: { ...Typography.body, color: Colors.textDark, paddingVertical: Spacing.sm },
  errorText: { ...Typography.caption, color: Colors.danger },
  rules: { gap: Spacing.sm, marginBottom: Spacing.xl },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ruleDot: {
    width: 18, height: 18, borderRadius: BorderRadius.full,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  ruleDotOk: { backgroundColor: Colors.success },
  ruleText: { ...Typography.caption, color: Colors.textLight },
  ruleTextOk: { color: Colors.success },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { ...Typography.h3, color: Colors.white },
});
