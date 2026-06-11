import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Star } from 'lucide-react-native';
import type { Testimonial } from '../types';

const ORANGE = '#FF6B00';

interface Props {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: Props) {
  const renderStars = (rating: number) => {
    return (
      <View style={s.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            color={i < rating ? ORANGE : '#333'}
            fill={i < rating ? ORANGE : 'none'}
            strokeWidth={2}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        {testimonial.avatar_url ? (
          <Image source={{ uri: testimonial.avatar_url }} style={s.avatar} />
        ) : (
          <View style={s.avatarPlaceholder}>
            <Text style={s.avatarPlaceholderText}>{testimonial.name[0]}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{testimonial.name}</Text>
          {renderStars(testimonial.rating)}
        </View>
      </View>
      <Text style={s.quote}>{testimonial.text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#1a1a1a',
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  quote: {
    fontSize: 12,
    color: '#bbb',
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
