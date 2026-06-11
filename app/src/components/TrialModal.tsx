import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Pressable,
} from 'react-native';
import { Zap, Clock, Lock, Gift } from 'lucide-react-native';
import { useAppStore } from '../store/useAppStore';
import { mmkvStorage } from '../store/storage';
import { colors } from '../theme/designTokens';

interface Props {
  onGoPaywall: () => void;
}

export default function TrialModal({ onGoPaywall }: Props) {
  const getTrialState  = useAppStore(s => s.getTrialState);
  const trialDaysLeft  = useAppStore(s => s.trialDaysLeft);
  const isPremium      = useAppStore(s => s.userSettings.is_premium);
  const isOnboarded    = useAppStore(s => s.isOnboarded);
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState<'welcome' | 'last_day' | 'grace' | null>(null);

  useEffect(() => {
    if (!isOnboarded || isPremium) return;
    const state = getTrialState();

    // Trial başladı — kutlama (sadece bir kez)
    if ((state === 'active' || state === 'last_day') && !mmkvStorage.getTrialModalShown('welcome')) {
      setModalType('welcome');
      setVisible(true);
      return;
    }

    // Son gün — günde bir kez göster
    const today = new Date().toDateString();
    if (state === 'last_day' && !mmkvStorage.getTrialModalShown(`last_day_${today}`)) {
      setModalType('last_day');
      setVisible(true);
      return;
    }

    // Grace period — her açılışta göster (grace_shown_today'e göre)
    if (state === 'grace' && !mmkvStorage.getTrialModalShown(`grace_${today}`)) {
      setModalType('grace');
      setVisible(true);
    }
  }, [isOnboarded, isPremium]);

  const dismiss = () => {
    const today = new Date().toDateString();
    if (modalType === 'welcome') mmkvStorage.setTrialModalShown('welcome');
    if (modalType === 'last_day') mmkvStorage.setTrialModalShown(`last_day_${today}`);
    if (modalType === 'grace')    mmkvStorage.setTrialModalShown(`grace_${today}`);
    setVisible(false);
  };

  const goPaywall = () => {
    dismiss();
    onGoPaywall();
  };

  if (!visible || !modalType) return null;

  const configs = {
    welcome: {
      icon: <Gift size={44} color={colors.primary} />,
      badge: '3 Günlük Business Deneme Başladı',
      title: 'Her şey açık — ücretsiz deneyin',
      body: 'İmza, takım yönetimi, 29 klavye teması, akıllı değişkenler...\nBu 3 günde Snippad\'ı sonuna kadar kullanın.',
      cta: 'Hadi Başlayalım',
      dismiss: 'Anladım',
    },
    last_day: {
      icon: <Clock size={44} color={colors.primary} />,
      badge: 'Denemenizin Son Günü',
      title: 'Bugün son gün!',
      body: 'Business denemeniz bugün bitiyor. Devam etmek için şimdi planınızı seçin ve kesintisiz kullanmaya devam edin.',
      cta: 'Planı Seç',
      dismiss: 'Biraz Sonra',
    },
    grace: {
      icon: <Zap size={44} color={colors.primary} />,
      badge: 'Denemeniz Sona Erdi',
      title: 'Snippad hâlâ sizin için burada',
      body: 'Business denemeniz bitti — ama şablonlarınız güvende. Bugün plan seçerseniz hiçbir şey kaybolmaz.',
      cta: 'Planı Seç ve Devam Et',
      dismiss: 'Şimdilik Kapat',
    },
  };

  const c = configs[modalType];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={s.overlay} onPress={dismiss}>
        <Pressable style={s.card} onPress={() => {}}>
          {/* İkon */}
          <View style={s.iconWrap}>{c.icon}</View>

          {/* Badge */}
          <View style={s.badge}>
            <Text style={s.badgeText}>{c.badge}</Text>
          </View>

          {/* İçerik */}
          <Text style={s.title}>{c.title}</Text>
          <Text style={s.body}>{c.body}</Text>

          {/* CTA */}
          <TouchableOpacity style={s.ctaBtn} onPress={goPaywall} activeOpacity={0.85}>
            <Text style={s.ctaTxt}>{c.cta}</Text>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity style={s.dismissBtn} onPress={dismiss} activeOpacity={0.7}>
            <Text style={s.dismissTxt}>{c.dismiss}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    width: '100%', maxWidth: 360,
    backgroundColor: colors.ink, borderRadius: 24,
    padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: colors.primarySoft, borderRadius: 999, borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14,
  },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  title:  { fontSize: 20, fontWeight: '800', color: colors.surface, textAlign: 'center', marginBottom: 10, lineHeight: 26 },
  body:   { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  ctaBtn: {
    width: '100%', backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 10,
  },
  ctaTxt:     { fontSize: 16, fontWeight: '800', color: colors.surface },
  dismissBtn: { paddingVertical: 8 },
  dismissTxt: { fontSize: 13, color: colors.textSecondary },
});
