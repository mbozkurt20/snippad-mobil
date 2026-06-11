import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Image, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Plus, Edit3, Trash2 } from 'lucide-react-native';
import { Colors, BorderRadius } from '../theme';
import { mmkvStorage } from '../store/storage';
import { SavedSignature } from '../types';
import { useAlert } from '../components/CustomAlert';

export default function SignatureManager({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [sigs, setSigs] = useState<SavedSignature[]>([]);
  const { showAlert } = useAlert();

  useFocusEffect(
    useCallback(() => {
      try {
        setSigs(mmkvStorage.getSignatures());
      } catch (e) {
        console.error('[SignatureManager] Error loading signatures:', e);
      }
    }, [])
  );

  const deleteSig = (id: string) => {
    showAlert({
      title: 'İmzayı Sil',
      message: 'Bu imzayı silmek istediğinizden emin misiniz?',
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil', style: 'destructive',
          onPress: () => {
            const updated = sigs.filter(s => s.id !== id);
            mmkvStorage.setSignatures(updated);
            setSigs(updated);
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <ChevronLeft size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.title}>İmzalarım</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate('SignatureDrawer', {})}
        >
          <Plus size={18} color="#fff" />
          <Text style={s.addTxt}>Yeni</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: Math.max(insets.bottom, 8) + 20 }]}>
        {sigs.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>✍️</Text>
            <Text style={s.emptyTitle}>Henüz imza eklenmedi</Text>
            <Text style={s.emptySub}>Parmağınızla imzanızı çizin ve kaydedin.</Text>
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => navigation.navigate('SignatureDrawer', {})}
            >
              <Text style={s.emptyBtnTxt}>İlk İmzamı Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.grid}>
            {sigs.map(sig => (
              <View key={sig.id} style={s.card}>
                <Image
                  source={{ uri: `data:image/png;base64,${sig.base64}` }}
                  style={s.preview}
                  resizeMode="contain"
                />
                <View style={s.cardBottom}>
                  <Text style={s.sigName} numberOfLines={1}>{sig.name}</Text>
                  <View style={s.cardActions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('SignatureDrawer', { editId: sig.id })}
                      style={s.actionBtn}
                    >
                      <Edit3 size={15} color={Colors.textGray} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSig(sig.id)} style={s.actionBtn}>
                      <Trash2 size={15} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = '47%';

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.background },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  back:        { marginRight: 8 },
  title:       { flex: 1, fontSize: 17, fontWeight: '600', color: Colors.textDark },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  addTxt:      { color: '#fff', fontWeight: '600', fontSize: 13 },
  body:        { padding: 16, flexGrow: 1 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:        { width: CARD_W, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  preview:     { width: '100%', height: 100, backgroundColor: '#fff' },
  cardBottom:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 0.5, borderColor: Colors.border },
  sigName:     { flex: 1, fontSize: 12, fontWeight: '500', color: Colors.textDark },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn:   { padding: 4 },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { fontSize: 16, fontWeight: '600', color: Colors.textDark, marginBottom: 6 },
  emptySub:    { fontSize: 13, color: Colors.textGray, textAlign: 'center', paddingHorizontal: 32, marginBottom: 20 },
  emptyBtn:    { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
