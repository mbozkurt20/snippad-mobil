import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronRight } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';
import { api } from '../store/api';
import ScreenHeader from '../components/ScreenHeader';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { SECTOR_PACKS } from '../constants/sectorPacks';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'SectorPacks'> };
type SectorPack = { id: string; name: string; emoji?: string; description: string; categories: any[] };

const SECTOR_COLORS = [Colors.primary, '#6B7280', '#9CA3AF', '#D1D5DB', '#78716C'];

export default function SectorPacksScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { showAlert, alertElement } = useAlert();
  const { addCategory, addTemplate, categories, installedPacks, markPackInstalled } = useAppStore();
  const [installing, setInstalling] = useState<string | null>(null);
  const [packs, setPacks] = useState<SectorPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const res = await api.get<any>('/sector-packs');
      setPacks(res.sector_packs || []);
    } catch (err) {
      console.error('Failed to load sector packs:', err);
      showAlert({
        title: 'Hata',
        message: 'Hazır paketler yüklenemedi.',
        buttons: [{ text: 'Tamam' }],
      });
    } finally {
      setLoading(false);
    }
  };

  const installPack = async (packId: string) => {
    const pack = packs.find((p: any) => p.id === packId);
    if (!pack) return;
    setInstalling(packId);
    try {
      for (const cat of pack.categories) {
        const existing = categories.find(c => c.name === cat.name);
        if (existing) continue; // zaten var
        const result = await addCategory(cat.name, cat.type as any, cat.icon, cat.color);
        if (result === 'ok') {
          const newCat = useAppStore.getState().categories.find(c => c.name === cat.name);
          if (newCat) {
            for (const tmpl of cat.templates) {
              await addTemplate(newCat.id, tmpl.title, tmpl.content, tmpl.shortcut);
            }
          }
        }
      }
      markPackInstalled(packId);
      showAlert({
        title: 'Paket Yüklendi',
        message: `${pack.name} paketi ${pack.categories.length} kategori ve ${pack.categories.reduce((s, c) => s + c.templates.length, 0)} şablon ile eklendi.`,
        buttons: [{ text: 'Tamam', style: 'default' }],
      });
    } catch {
      showAlert({ title: 'Hata', message: 'Paket yüklenirken sorun oluştu.', buttons: [{ text: 'Tamam' }] });
    } finally {
      setInstalling(null);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {alertElement}
      <ScreenHeader
        title="Hazır Paketler"
        subtitle="Sektörünüze özel şablonları tek tıkla yükleyin"
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingVertical: Spacing.lg, paddingBottom: Math.max(insets.bottom, 8) + 100 }}>
        {SECTOR_PACKS.map((pack, idx) => {
          const isInstalling = installing === pack.id;
          const isInstalled  = installedPacks.includes(pack.id);
          const color = SECTOR_COLORS[idx % SECTOR_COLORS.length];
          const totalTemplates = pack.categories.reduce((s, c) => s + c.templates.length, 0);

          return (
            <View key={pack.id} style={[s.card, { borderLeftColor: color, borderLeftWidth: 8 }]}>
              {/* Gradient Header */}
              <View style={[s.cardHeader, { backgroundColor: color + '15' }]}>
                <View style={[s.colorCircle, { backgroundColor: color }]} />
              </View>

              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <Text style={s.packName}>{pack.name}</Text>
                  <Text style={s.packDesc}>{pack.description}</Text>

                  {/* Compact info */}
                  <View style={s.metaRow}>
                    <Text style={s.packMeta}>{pack.categories.length} kategori • {totalTemplates} şablon</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.installBtn, isInstalled && s.installedBtn, { backgroundColor: isInstalled ? Colors.border : Colors.primary }]}
                  onPress={() => !isInstalled && !isInstalling && installPack(pack.id)}
                  disabled={isInstalling || isInstalled}
                  activeOpacity={0.85}>
                  {isInstalling ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : isInstalled ? (
                    <>
                      <Check size={16} color={Colors.textMuted} />
                      <Text style={[s.installTxt, { color: Colors.textMuted }]}>Yüklendi</Text>
                    </>
                  ) : (
                    <>
                      <Text style={[s.installTxt, { color: Colors.white }]}>Paketi Yükle</Text>
                      <ChevronRight size={16} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, gap: 12 },
  backBtn:      { padding: 8 },
  title:        { fontSize: 20, fontWeight: '800', color: Colors.textDark, letterSpacing: -0.5 },
  subtitle:     { fontSize: 13, color: Colors.textGray, marginTop: 4, fontWeight: '500' },
  scroll:       { flex: 1 },
  card: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    overflow: 'hidden',
  },
  cardHeader:   { height: 60, justifyContent: 'center', alignItems: 'center' },
  colorCircle:  { width: 40, height: 40, borderRadius: 20, opacity: 0.9 },
  cardBody:     { padding: 18 },
  cardTop:      { flex: 1 },
  packName:     { fontSize: 18, fontWeight: '900', color: Colors.textDark, letterSpacing: -0.5, marginBottom: 4 },
  packDesc:     { fontSize: 13, color: Colors.textGray, marginBottom: 12, lineHeight: 19, fontWeight: '500' },
  metaRow:      { flexDirection: 'row', gap: 16, marginBottom: 12 },
  packMeta:     { fontSize: 12, color: Colors.textGray, fontWeight: '700', letterSpacing: 0.3 },
  installBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: BorderRadius.lg, marginTop: 8,
  },
  installedBtn: { backgroundColor: '#F0FDF4' },
  installTxt:   { fontSize: 14, fontWeight: '900', letterSpacing: -0.3 },
  installedTxt: { fontSize: 14, fontWeight: '900', letterSpacing: -0.3 },
});
