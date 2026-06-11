import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Zap, Star } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useT } from '../i18n';

interface Props {
  visible: boolean;
  planName: string;
  planAccent: string;
  features: string[];
  onContinue: () => void;
}

export default function SubscriptionSuccess({ visible, planName, planAccent, features, onContinue }: Props) {
  const T = useT();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const starsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0);
      opacity.setValue(0);
      checkScale.setValue(0);
      starsOpacity.setValue(0);
      return;
    }
    // Giriş animasyonu — sıralı
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.spring(checkScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
      Animated.timing(starsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={s.overlay}>
        <Animated.View style={[s.card, { transform: [{ scale }], opacity }]}>
          {/* Konfeti yıldızlar */}
          <Animated.View style={[s.stars, { opacity: starsOpacity }]}>
            {['⭐', '✨', '🎉', '⭐', '✨'].map((star, i) => (
              <Text key={i} style={[s.starEmoji, { transform: [{ rotate: `${i * 15 - 30}deg` }] }]}>
                {star}
              </Text>
            ))}
          </Animated.View>

          {/* Check ikonu */}
          <Animated.View style={[s.checkCircle, { backgroundColor: planAccent, transform: [{ scale: checkScale }] }]}>
            <Check size={36} color="#fff" strokeWidth={3} />
          </Animated.View>

          <Text style={s.congrats}>{T.congrats}</Text>
          <Text style={[s.planName, { color: planAccent }]}>{planName}</Text>
          <Text style={s.subtitle}>{T.upgradedToPlan}</Text>

          {/* Özellikler */}
          <View style={s.features}>
            {features.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={[s.featureDot, { backgroundColor: planAccent }]}>
                  <Check size={10} color="#fff" />
                </View>
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={s.hint}>{T.kbSettingsUpdated}</Text>

          <TouchableOpacity
            style={[s.btn, { backgroundColor: planAccent }]}
            onPress={onContinue}
            activeOpacity={0.85}>
            <Zap size={18} color="#fff" />
            <Text style={s.btnText}>{T.letsGoStart}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%', backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 20,
  },
  stars: {
    flexDirection: 'row', gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  starEmoji: { fontSize: 20 },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  congrats: { ...Typography.h2, color: Colors.textDark, marginBottom: Spacing.xs },
  planName: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { ...Typography.body, color: Colors.textGray, marginBottom: Spacing.xl },
  features: { width: '100%', gap: Spacing.sm, marginBottom: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  featureDot: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { ...Typography.body, color: Colors.textDark },
  hint: {
    ...Typography.caption, color: Colors.textGray,
    textAlign: 'center', lineHeight: 18, marginBottom: Spacing.xl,
  },
  btn: {
    width: '100%', borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 4,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm,
  },
  btnText: { ...Typography.h3, color: '#fff' },
});
