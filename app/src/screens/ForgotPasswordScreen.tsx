import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, CheckCircle } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useAlert } from '../components/CustomAlert';
import { useT } from '../i18n';
import { api } from '../store/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>; route?: any };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const T = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showAlert, alertElement } = useAlert();

  const handleSend = async () => {
    if (!email.trim()) {
      showAlert({ title: T.error, message: T.email, buttons: [{ text: T.ok, style: 'default' }] });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (e: any) {
      showAlert({ title: T.error, message: e.message, buttons: [{ text: T.ok, style: 'default' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {alertElement}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <ChevronLeft size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={s.title}>{T.resetPasswordTitle}</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Content */}
          <View style={s.content}>
            {!sent ? (
              <>
                <View style={s.iconBox}>
                  <Mail size={48} color={Colors.primary} />
                </View>

                <Text style={s.mainText}>{T.forgotPassword}</Text>
                <Text style={s.subText}>E-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.</Text>

                <TextInput
                  style={s.input}
                  placeholder={T.email}
                  placeholderTextColor={Colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={[s.btn, loading && s.btnDisabled]}
                  onPress={handleSend}
                  disabled={loading}
                >
                  <Text style={s.btnText}>{loading ? T.loading : T.sendResetLink}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={s.backLink}>{T.backToLogin}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={s.successBox}>
                  <CheckCircle size={60} color={Colors.primary} />
                </View>

                <Text style={s.mainText}>{T.success}</Text>
                <Text style={s.subText}>{T.resetSent}</Text>

                <Text style={s.infoText}>
                  E-postayı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın. Bağlantı 1 saat boyunca geçerlidir.
                </Text>

                <TouchableOpacity
                  style={s.btn}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={s.btnText}>Giriş Ekranına Dön</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setSent(false); setEmail(''); }}>
                  <Text style={s.backLink}>Başka bir e-posta dene</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, marginBottom: 24 },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textDark, flex: 1, textAlign: 'center' },
  content: { paddingVertical: 24 },
  iconBox: { alignItems: 'center', marginBottom: 32 },
  successBox: { alignItems: 'center', marginBottom: 32 },
  mainText: { fontSize: 24, fontWeight: '700', color: Colors.textDark, textAlign: 'center', marginBottom: 12 },
  subText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  highlight: { color: Colors.primary, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: Colors.textDark, marginBottom: 20, backgroundColor: Colors.white,
  },
  infoText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 32, backgroundColor: Colors.lightGray, padding: 12, borderRadius: BorderRadius.sm },
  btn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backLink: { color: Colors.primary, fontSize: 15, fontWeight: '500', textAlign: 'center' },
});
