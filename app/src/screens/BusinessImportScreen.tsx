import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Upload, Download } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useAppStore } from '../store/useAppStore';
import ScreenHeader from '../components/ScreenHeader';
import { api } from '../store/api';
import { Colors } from '../theme';
import { useT } from '../i18n';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';

const SAMPLE_CSV =
`kategori_adi,sablon_adi,sablon_icerik
Selamlama,Resmi Merhaba,"Merhaba, umarım iyisinizdir."
İş,Toplantı Daveti,"Toplantıya davet edildiniz. Lütfen katılımınızı onaylayın."`;

const SAMPLE_JSON = JSON.stringify([
  { category: 'Selamlama', name: 'Resmi Merhaba', content: 'Merhaba, umarım iyisinizdir.' },
  { category: 'İş', name: 'Toplantı Daveti', content: 'Toplantıya davet edildiniz.' },
], null, 2);


async function downloadSample(type: 'csv' | 'json') {
  try {
    const url = type === 'csv'
      ? 'https://api.vertexforge.tech/sample.csv'
      : 'https://api.vertexforge.tech/sample.json';

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const content = await response.text();
    const filename = type === 'csv' ? 'sablon_ornegi.csv' : 'sablon_ornegi.json';
    const file = new File(Paths.cache, filename);

    await file.write(content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: type === 'csv' ? 'text/csv' : 'application/json',
        dialogTitle: 'Örnek dosyayı kaydet',
      });
    } else {
      Alert.alert('Başarılı', `Örnek dosya indirildi:\n${filename}`);
    }
  } catch (e: any) {
    Alert.alert('Hata', `Örnek dosya indirilemedi: ${e.message}`);
  }
}

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'BusinessImport'> };

export default function BusinessImportScreen({ navigation }: Props) {
  const T = useT();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<string>('');
  const { loadFromApi } = useAppStore();

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'application/json', 'text/plain', '*/*'] });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      setLoading(true); setErrors([]); setResult('');

      // Backend'e dosya gönder
      const formData = new FormData();

      // Web vs Mobile: Different file handling
      if (typeof window !== 'undefined') {
        // Web: DocumentPicker may return base64 (with or without data URL prefix) or uri
        try {
          let base64Data = (asset as any).base64 || (asset as any).data;

          if (base64Data) {
            // Data URL prefix'i kaldır (data:text/csv;base64, veya benzer)
            if (base64Data.includes('base64,')) {
              base64Data = base64Data.split('base64,')[1];
              console.log('[Data URL Detected] Extracted base64 content');
            }

            // Base64 verisi var, decode et
            try {
              console.log('[Base64 Decoding] input length:', base64Data.length);
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: asset.mimeType || 'text/plain' });
              console.log('[Blob Created] size:', blob.size, 'type:', blob.type);
              formData.append('file', blob, asset.name);
            } catch (decodeErr) {
              // Base64 decode başarısız, metin olarak işle
              console.log('[Base64 Decode Failed], using raw text:', (decodeErr as Error).message);
              const blob = new Blob([base64Data], { type: asset.mimeType || 'text/plain' });
              console.log('[Blob Created from Text] size:', blob.size, 'type:', blob.type);
              formData.append('file', blob, asset.name);
            }
          } else if (asset.uri) {
            // URI varsa dosyayı fetch et
            console.log('[Fetching from URI]', asset.uri);
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            console.log('[Blob from URI] size:', blob.size);
            formData.append('file', blob, asset.name);
          } else {
            throw new Error('Dosya verisi alınamadı (ne base64 ne uri)');
          }
        } catch (e: any) {
          throw new Error(`Dosya işlenemiyor: ${e.message}`);
        }
      } else {
        // Mobile: append as object (React Native FormData handles conversion)
        if (!asset.uri) throw new Error('Dosya URI bulunamadı');
        formData.append('file', {
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          name: asset.name,
        } as any);
      }

      // Debug: FormData içeriğini logla
      const entries = Array.from((formData as any).entries?.() || []);
      console.log('[FormData Contents]', entries);

      // File blob'unu oku ve preview göster
      const fileEntry = entries.find(([key]: any) => key === 'file');
      if (fileEntry) {
        const blob = fileEntry[1] as Blob;
        const text = await blob.text?.() || 'Cannot read';
        const preview = typeof text === 'string' ? text.substring(0, 200) : text;
        console.log('[File Blob Preview]', 'size:', blob.size, 'content:', preview);
      }

      const response = await api.post<any>('/categories/bulk-import', formData);
      const { added = 0, updated = 0, errors: backendErrors = [], message = '' } = (response as any) || {};

      setResult(message || `${added} şablon eklendi, ${updated} şablon güncellendi.`);
      if (backendErrors && backendErrors.length > 0) {
        setErrors(backendErrors);
      }

      // Kategorileri reload et
      await loadFromApi();
    } catch (e: any) {
      setErrors([`Hata: ${e?.message || 'Bilinmeyen hata'}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScreenHeader
        title={T.bulkImportTitle || 'Toplu İçe Aktar'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={s.body}>
        {/* Format info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Desteklenen Formatlar</Text>
          <Text style={s.hint}>CSV: kategori_adi, sablon_adi, sablon_icerik (başlık satırı zorunlu)</Text>
          <Text style={[s.hint, { marginTop: 4 }]}>JSON: {`[{"category":"...","name":"...","content":"..."}]`}</Text>
        </View>

        {/* Sample download */}
        <View style={s.downloadRow}>
          <TouchableOpacity style={s.downloadBtn} onPress={() => downloadSample('csv')}>
            <Download size={14} color={Colors.primary} />
            <Text style={s.downloadTxt}>CSV İndir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.downloadBtn} onPress={() => downloadSample('json')}>
            <Download size={14} color={Colors.primary} />
            <Text style={s.downloadTxt}>JSON İndir</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <TouchableOpacity style={s.btn} onPress={pickFile} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Upload size={16} color="#fff" />}
          <Text style={s.btnTxt}>{loading ? 'İşleniyor…' : 'Dosya Seç ve İçe Aktar'}</Text>
        </TouchableOpacity>

        {/* Result */}
        {!!result && (
          <View style={s.resultBox}>
            <Text style={s.resultTxt}>{result}</Text>
          </View>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <View style={s.errorBox}>
            <Text style={s.errorTitle}>Uyarılar ({errors.length})</Text>
            {errors.map((e, i) => <Text key={i} style={s.errorLine}>• {e}</Text>)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  back:         { marginRight: 8 },
  headerTitle:  { fontSize: 17, fontWeight: '600', color: Colors.textDark },
  body:         { padding: 20, gap: 16 },
  card:         { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: Colors.border },
  cardTitle:    { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  hint:         { fontSize: 12, color: Colors.textGray, lineHeight: 18 },
  btn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14 },
  btnTxt:       { color: '#fff', fontWeight: '600', fontSize: 14 },
  resultBox:    { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#6EE7B7' },
  resultTxt:    { color: '#065F46', fontSize: 13, fontWeight: '500' },
  errorBox:     { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#FECACA' },
  errorTitle:   { color: '#991B1B', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  errorLine:    { color: '#B91C1C', fontSize: 12, lineHeight: 18 },
  downloadRow:  { flexDirection: 'row', gap: 10 },
  downloadBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 10 },
  downloadTxt:  { color: Colors.primary, fontWeight: '600', fontSize: 13 },
});
