import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SectionList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Grid3X3, Trash2, Edit2, FileText, Clipboard, Check } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { useT } from '../i18n';
import { useAppStore } from '../store/useAppStore';
import ScreenHeader from '../components/ScreenHeader';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'TemplateManager'>;
};

export default function TemplateManagerScreen({ navigation }: Props) {
  const T = useT();
  const { categories, deleteTemplate } = useAppStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const allTemplateIds = useMemo(() => {
    return categories.flatMap(cat => cat.templates.map(t => t.id));
  }, [categories]);

  const toggleSelect = (templateId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(allTemplateIds));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    Alert.alert(
      `${selected.size} şablonı sil?`,
      'Bu işlem geri alınamaz.',
      [
        { text: 'İptal', onPress: () => {} },
        {
          text: 'Sil',
          onPress: () => {
            selected.forEach(id => {
              const cat = categories.find(c => c.templates.some(t => t.id === id));
              if (cat) {
                const template = cat.templates.find(t => t.id === id);
                if (template) deleteTemplate(cat.id, id);
              }
            });
            setSelected(new Set());
            setSelectAll(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExport = () => {
    const toExport = selected.size > 0 ? Array.from(selected) : allTemplateIds;
    const templates: any[] = [];
    categories.forEach(cat => {
      cat.templates.forEach(tpl => {
        if (toExport.includes(tpl.id)) {
          templates.push({ category: cat.name, title: tpl.title, content: tpl.content });
        }
      });
    });
    const json = JSON.stringify(templates, null, 2);
    const uri = `data:application/json,${encodeURIComponent(json)}`;
    Alert.alert('Export hazır', 'JSON veri kopyalandı');
  };

  const sections = useMemo(() => {
    return categories.map(cat => ({
      title: cat.name,
      data: cat.templates,
      categoryId: cat.id,
      categoryType: cat.type,
      categoryColor: cat.color,
    }));
  }, [categories]);

  const totalTemplates = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.templates.length, 0);
  }, [categories]);

  const renderTemplate = ({ item, index, section }: any) => {
    const isSelected = selected.has(item.id);
    return (
      <View style={[s.templateRow, isSelected && s.templateRowSelected]}>
        <TouchableOpacity
          style={s.checkbox}
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.6}
        >
          {isSelected && <Check size={16} color={Colors.primary} />}
        </TouchableOpacity>
        <View style={s.templateContent}>
          <Text style={s.templateTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={s.templatePreview} numberOfLines={1}>
            {item.content}
          </Text>
        </View>
        <View style={s.templateActions}>
          <TouchableOpacity style={s.actionBtn} activeOpacity={0.6}>
            <Edit2 size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.deleteBtnColor]} activeOpacity={0.6}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View
      style={[
        s.sectionHeader,
        { backgroundColor: section.categoryColor + '15' },
      ]}
    >
      <View style={[s.categoryDot, { backgroundColor: section.categoryColor }]} />
      <View style={s.sectionInfo}>
        <Text style={s.sectionTitle}>{section.title}</Text>
        <Text style={s.sectionCount}>
          {section.data.length} şablon
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScreenHeader
        title="Şablonları Yönet"
        onBack={() => navigation.goBack()}
      />

      {/* Stats or Selection Mode */}
      <View style={s.statsBox}>
        {selected.size === 0 ? (
          <>
            <View style={s.statItem}>
              <Grid3X3 size={20} color={Colors.primary} />
              <Text style={s.statValue}>{categories.length}</Text>
              <Text style={s.statLabel}>Kategori</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <FileText size={20} color={Colors.primary} />
              <Text style={s.statValue}>{totalTemplates}</Text>
              <Text style={s.statLabel}>Şablon</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={s.selectionText}>{selected.size} seçili</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={s.selectBtn} onPress={toggleSelectAll}>
              <Text style={s.selectBtnText}>
                {selectAll ? 'Tümü Kaldır' : 'Tümünü Seç'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Templates List */}
      {categories.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderTemplate}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        />
      ) : (
        <View style={s.emptyState}>
          <Clipboard size={56} color={Colors.primary} style={{ marginBottom: 16 }} />
          <Text style={s.emptyText}>Henüz şablon yok</Text>
          <Text style={s.emptySubtext}>
            Dashboard'dan kategori ve şablon ekle
          </Text>
        </View>
      )}

      {/* Bulk Actions Footer */}
      {selected.size > 0 && (
        <View style={s.actionFooter}>
          <TouchableOpacity style={[s.actionFooterBtn, s.exportBtn]} onPress={handleExport}>
            <FileText size={16} color={Colors.primary} />
            <Text style={s.actionFooterBtnText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionFooterBtn, s.deleteBtn]} onPress={handleBulkDelete}>
            <Trash2 size={16} color="#EF4444" />
            <Text style={[s.actionFooterBtnText, { color: '#EF4444' }]}>Sil</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textDark },

  statsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: Colors.cardLight,
    borderRadius: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  statLabel: { fontSize: 12, color: Colors.textLight },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  sectionInfo: { flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  sectionCount: { fontSize: 12, color: Colors.textLight },

  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  templateContent: { flex: 1 },
  templateTitle: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  templatePreview: { fontSize: 12, color: Colors.textLight },
  templateActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
  deleteBtnColor: { opacity: 0.7 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: Colors.textLight, textAlign: 'center' },

  checkbox: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 6 },
  templateRowSelected: { backgroundColor: 'rgba(255, 85, 0, 0.08)', borderColor: Colors.primary, borderWidth: 1.5 },

  selectionText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  selectBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.primary, borderRadius: 8 },
  selectBtnText: { fontSize: 12, color: Colors.white, fontWeight: '600' },

  actionFooter: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: Colors.border, backgroundColor: Colors.background },
  actionFooterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 8 },
  exportBtn: { backgroundColor: 'rgba(255, 85, 0, 0.1)', borderWidth: 1, borderColor: Colors.primary },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#EF4444' },
  actionFooterBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
