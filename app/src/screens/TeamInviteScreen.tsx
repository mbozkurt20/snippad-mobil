import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Users, CheckCircle, XCircle } from 'lucide-react-native';
import { api } from '../store/api';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';
import { Colors } from '../theme';

interface InviteInfo {
  token: string;
  team_name: string;
  role: string;
  email: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  editor: 'Editör',
  viewer: 'İzleyici',
};

export default function TeamInviteScreen({ route, navigation }: any) {
  const token = route.params?.token as string;
  const { showAlert } = useAlert();
  const isLoggedIn = useAppStore(s => s.userSettings.is_logged_in);
  const userEmail  = useAppStore(s => s.userSettings.profile.email);

  const [invite, setInvite]   = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError('Geçersiz davet linki.'); setLoading(false); return; }
    api.get<{ invite: InviteInfo }>(`/team/invite/${token}`)
      .then(r => setInvite(r.invite))
      .catch(() => setError('Davet bulunamadı veya süresi doldu.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!isLoggedIn) {
      // Giriş ekranına yönlendir, geri döndüğünde tekrar dene
      navigation.navigate('Login');
      return;
    }
    setAccepting(true);
    try {
      await api.post(`/team/invite/${token}/accept`, {});
      setDone(true);
    } catch (e: any) {
      showAlert({
        title: 'Hata',
        message: e?.message ?? 'Davet kabul edilemedi.',
        buttons: [{ text: 'Tamam' }],
      });
    } finally {
      setAccepting(false);
    }
  }

  function handleClose() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Main');
  }

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={s.center}>
        <XCircle size={56} color="#EF4444" />
        <Text style={s.errorTitle}>Davet Geçersiz</Text>
        <Text style={s.errorSub}>{error}</Text>
        <TouchableOpacity style={s.btnSecondary} onPress={handleClose}>
          <Text style={s.btnSecondaryTxt}>Kapat</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={s.center}>
        <CheckCircle size={56} color="#10B981" />
        <Text style={s.successTitle}>Daveti Kabul Ettiniz! 🎉</Text>
        <Text style={s.successSub}>
          <Text style={{ fontWeight: '700' }}>{invite?.team_name}</Text> ekibine{' '}
          <Text style={{ fontWeight: '700' }}>{ROLE_LABELS[invite?.role ?? ''] ?? invite?.role}</Text>{' '}
          olarak katıldınız.
        </Text>
        <TouchableOpacity style={s.btnPrimary} onPress={handleClose}>
          <Text style={s.btnPrimaryTxt}>Uygulamaya Git</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const roleLabel = ROLE_LABELS[invite?.role ?? ''] ?? invite?.role;
  const emailMismatch = isLoggedIn && invite?.email && userEmail &&
    userEmail.toLowerCase() !== invite.email.toLowerCase();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.card}>
        {/* İkon */}
        <View style={s.iconWrap}>
          <Users size={32} color={Colors.primary} />
        </View>

        {/* Başlık */}
        <Text style={s.tagline}>Takım Daveti</Text>
        <Text style={s.title}>
          <Text style={{ color: Colors.primary }}>{invite?.team_name}</Text>{' '}
          ekibine davet edildiniz
        </Text>
        <Text style={s.sub}>
          Bu ekipte <Text style={{ fontWeight: '700', color: Colors.text }}>{roleLabel}</Text> rolüyle yer alacaksınız.
        </Text>

        {/* E-posta uyarısı */}
        {emailMismatch && (
          <View style={s.warningBox}>
            <Text style={s.warningTxt}>
              ⚠️ Bu davet <Text style={{ fontWeight: '700' }}>{invite?.email}</Text> adresine gönderildi.
              Lütfen o e-posta ile giriş yapın.
            </Text>
          </View>
        )}

        {/* Giriş yapılmamış uyarısı */}
        {!isLoggedIn && (
          <View style={s.infoBox}>
            <Text style={s.infoTxt}>
              Daveti kabul etmek için önce giriş yapmanız gerekiyor.{'\n'}
              Hesabınız yoksa <Text style={{ fontWeight: '700' }}>{invite?.email}</Text> ile kayıt olun.
            </Text>
          </View>
        )}

        {/* Buton */}
        {!emailMismatch && (
          <TouchableOpacity
            style={[s.btnPrimary, accepting && { opacity: 0.6 }]}
            onPress={handleAccept}
            disabled={accepting}
          >
            {accepting
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryTxt}>
                  {isLoggedIn ? 'Daveti Kabul Et' : 'Giriş Yap ve Kabul Et'}
                </Text>
            }
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.btnSecondary} onPress={handleClose}>
          <Text style={s.btnSecondaryTxt}>Şimdi Değil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 24 },
  center:    { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 68, height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tagline: { fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  title:   { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 10, lineHeight: 28 },
  sub:     { fontSize: 15, color: Colors.textLight, textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  warningBox: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 14, marginBottom: 20, width: '100%' },
  warningTxt: { fontSize: 13, color: '#92400E', lineHeight: 19, textAlign: 'center' },

  infoBox: { backgroundColor: Colors.elevated, borderRadius: 10, padding: 14, marginBottom: 20, width: '100%' },
  infoTxt: { fontSize: 13, color: Colors.textLight, lineHeight: 19, textAlign: 'center' },

  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  btnSecondary: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  btnSecondaryTxt: { color: Colors.textLight, fontSize: 14 },

  errorTitle:   { fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  errorSub:     { fontSize: 14, color: Colors.textLight, textAlign: 'center', marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginTop: 16, marginBottom: 8 },
  successSub:   { fontSize: 15, color: Colors.textLight, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
});
