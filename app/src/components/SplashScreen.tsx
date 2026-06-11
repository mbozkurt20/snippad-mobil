import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../theme';
import { colors } from '../theme/designTokens';

export default function SplashScreen() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotation animation (continuous)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Scale + Opacity entrance
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={s.root}>
      {/* Gradient background overlay */}
      <View style={s.gradientBg} />

      {/* Animated logo container */}
      <Animated.View
        style={[
          s.logoContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Logo circle with glow */}
        <View style={s.glow} />
        <View style={s.logo}>
          <Text style={s.logoText}>✏️</Text>
        </View>
      </Animated.View>

      {/* App name with animation */}
      <Animated.Text
        style={[
          s.appName,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        Snippad
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        style={[
          s.subtitle,
          {
            opacity: Animated.multiply(opacityAnim, 0.8),
          },
        ]}
      >
        Hızlı Yapıştır, Akıllı Yazı
      </Animated.Text>

      {/* Animated dots loader */}
      <View style={s.loaderContainer}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
    </View>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: bounceAnim }],
      }}
      onTouchEnd={() => {}}
    >
      <View style={s.dot} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  gradientBg: {
    position: 'absolute' as any,
    width: '100%' as any,
    height: '100%' as any,
    background: `linear-gradient(135deg, ${colors.surfaceAlt} 0%, ${colors.border} 50%, ${colors.surfaceAlt} 100%)` as any,
    // Fallback for React Native
    backgroundColor: colors.surfaceAlt,
  },

  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },

  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },

  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },

  logoText: {
    fontSize: 60,
  },

  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.8,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textGray,
    letterSpacing: 0.3,
    marginBottom: 80,
    fontWeight: '500',
  },

  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
