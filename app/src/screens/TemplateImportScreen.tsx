import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Download, FolderOpen, FileText } from 'lucide-react-native';
import { Colors, BorderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';

export interface SharePayload {
  v: number;
  type: 'template' | 'category';
  category: string;
  templates: Array<{ title: string; content: string; shortcut?: string }>;
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  // URL-safe base64 encoding without escape/unescape (Hermes compatible)
  const bytes = encodeURIComponent(json)
    .replace(/%([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    // Restore standard base64 from URL-safe base64
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '==='.slice((b64.length + 3) % 4);
    const bytes = atob(padded);
    const json = decodeURIComponent(
      bytes.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const p = JSON.parse(json) as SharePayload;
    if (!p.v || !p.category || !Array.isArray(p.templates)) return null;
    return p;
  } catch {
    return null;
  }
}

export default function TemplateImportScreen({ navigation, route }: any) {
  const data: string | undefined = route?.params?.data;
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<{ added: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { categories, addCategory, addTemplate, updateTemplate } = useAppStore();
  const { alertElement } = useAlert();

  useEffect(() => {
    if (!data) { setError('Geçersiz paylaşım linki.'); return; }
    const p = decodeSharePayload(data);
    if (!p) { setError('Link okunamadı veya bozuk.'); return; }
    setPayload(p);
  }, [data]);

  const handleImport = async () => {
    if (!payload) return;
    setImporting(true);
    let added = 0, updated = 0;
    try {
      for (const tpl of payload.templates) {
        let cat = categories.find(c => c.name.toLowerCase() === payload.category.toLowerCase());
        if (!cat) {
          try {
            const r = await addCategory(payload.category, 'text', 'file-text', Colors.primary);
            if (r === 'limit') {
              setError('Kategori limitine ulaştın. Daha fazla kategori eklemek için planını yükselt.');
              break;
            }
            cat = useAppStore.getState().categories.find(c => c.name.toLowerCase() === payload.category.toLowerCase());
          } catch (err: any) {
            setError(err.message || 'Kategori oluşturulamadı.');
            break;
          }
        }
        if (!cat) continue;
        const existing = cat.templates.find(t => t.title.toLowerCase() === tpl.title.toLowerCase());
        if (existing) {
          await updateTemplate(cat.id, existing.id, { title: tpl.title, content: tpl.content, ...(tpl.shortcut ? { shortcut: tpl.shortcut } : {}) });
          updated++;
        } else {
          try {
            const r = await addTemplate(cat.id, tpl.title, tpl.content, tpl.shortcut);
            if (r === 'limit') {
              setError('Şablon limitine ulaştın. Daha fazla şablon eklemek için planını yükselt.');
              break;
            }
            added++;
          } catch (err: any) {
            setError(err.message || 'Şablon oluşturulamadı.');
            break;
          }
        }
      }
      if (!error) setDone({ added, updated });
    } catch (err: any) {
      setError(err.message || 'İçe aktarım sırasında hata oluştu.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {alertElement}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <ChevronLeft size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.title}>Şablon Al</Text>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorTxt}>{error}</Text>
          </View>
        ) : done ? (
          <View style={s.successBox}>
            <Text style={s.successIcon}>✅</Text>
            <Text style={s.successTitle}>Aktarım Tamamlandı</Text>
            <Text style={s.successSub}>
              {done.added} şablon eklendi{done.updated > 0 ? `, ${done.updated} güncellendi` : ''}.
            </Text>
            <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
              <Text style={s.doneBtnTxt}>Tamam</Text>
            </TouchableOpacity>
          </View>
        ) : payload ? (
          <>
            <View style={s.previewCard}>
              <View style={s.previewHeader}>
                <FolderOpen size={18} color={Colors.primary} />
                <Text style={s.catName}>{payload.category}</Text>
                <View style={s.countBadge}>
                  <Text style={s.countTxt}>{payload.templates.length} şablon</Text>
                </View>
              </View>
              <View style={s.divider} />
              {payload.templates.map((t, i) => (
                <View key={i} style={[s.tplRow, i > 0 && s.tplRowBorder]}>
                  <FileText size={14} color={Colors.textLight} />
                  <View style={s.tplText}>
                    <Text style={s.tplTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={s.tplContent} numberOfLines={1}>{t.content}</Text>
                  </View>
                  {t.shortcut ? <Text style={s.shortcutBadge}>{t.shortcut}</Text> : null}
                </View>
              ))}
            </View>

            <Text style={s.hint}>
              "{payload.category}" kategorisine eklenecek. Kategori yoksa otomatik oluşturulur.
            </Text>

            <TouchableOpacity style={s.importBtn} onPress={handleImport} disabled={importing}>
              {importing
                ? <ActivityIndicator color="#fff" size="small" />
                : <Download size={16} color="#fff" />}
              <Text style={s.importBtnTxt}>
                {importing ? 'Aktarılıyor…' : 'Şablonları İçe Aktar'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.background },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: Colors.border },
  back:          { marginRight: 8 },
  title:         { fontSize: 17, fontWeight: '600', color: Colors.textDark },
  body:          { padding: 20, gap: 16 },
  previewCard:   { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  catName:       { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textDark },
  countBadge:    { backgroundColor: Colors.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countTxt:      { fontSize: 11, fontWeight: '600', color: Colors.primary },
  divider:       { height: 0.5, backgroundColor: Colors.border },
  tplRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  tplRowBorder:  { borderTopWidth: 0.5, borderColor: Colors.border },
  tplText:       { flex: 1, gap: 2 },
  tplTitle:      { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  tplContent:    { fontSize: 11, color: Colors.textGray },
  shortcutBadge: { fontSize: 10, color: Colors.primary, backgroundColor: Colors.primaryLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  hint:          { fontSize: 12, color: Colors.textGray, textAlign: 'center', paddingHorizontal: 8 },
  importBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14 },
  importBtnTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorBox:      { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 20, alignItems: 'center' },
  errorTxt:      { color: '#B91C1C', fontSize: 14, textAlign: 'center' },
  successBox:    { alignItems: 'center', paddingTop: 40, gap: 8 },
  successIcon:   { fontSize: 48 },
  successTitle:  { fontSize: 18, fontWeight: '700', color: Colors.textDark },
  successSub:    { fontSize: 14, color: Colors.textGray, textAlign: 'center' },
  doneBtn:       { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  doneBtnTxt:    { color: '#fff', fontWeight: '700', fontSize: 15 },
});
