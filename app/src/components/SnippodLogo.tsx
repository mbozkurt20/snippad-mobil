import React from 'react';
import { View, Text } from 'react-native';

interface LogoProps {
  size?: number;
  color?: string;
  bgColor?: string;
}

export default function SnippodLogo({ size = 24, color = '#FFFFFF', bgColor = '#FF6B1A' }: LogoProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.55, fontWeight: '800', color }}>S</Text>
    </View>
  );
}
