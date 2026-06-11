import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trash2, Undo2, Zap } from 'lucide-react-native';
import { SettingsStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';
import ScreenHeader from '../components/ScreenHeader';
import { useT } from '../i18n';
import { iconMap } from '../components/CategoryCard';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'DeletedCategories'> };

export default function DeletedCategoriesScreen({ navigation }: Props) {
  const T = useT();
  const { showAlert, alertElement } = useAlert();
  const deletedCategories = useAppStore(s => s.deletedCategories);
  const fetchDeletedCategories = useAppStore(s => s.fetchDeletedCategories);
  const restoreCategory = useAppStore(s => s.restoreCategory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDeleted();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDeleted = async () => {
    try {
      setLoading(true);
      await fetchDeletedCategories();
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (categoryId: string, name: string) => {
    showAlert({
      title: T.restoreCategory,
      message: `${name} geri yüklenecek.`,
      buttons: [
        { text: T.cancel, style: 'cancel' },
        {
          text: T.restoreCategory,
          style: 'default',
          onPress: async () => {
            try {
              await restoreCategory(categoryId);
              await loadDeleted();
              showAlert({
                title: T.success,
                message: T.categoryRestored(name),
                buttons: [{ text: T.ok, style: 'default' }],
              });
            } catch (e: any) {
              showAlert({
                title: T.error,
                message: e?.message ?? T.restoreFailed,
                buttons: [{ text: T.ok, style: 'default' }],
              });
            }
          },
        },
      ],
    });
  };

  return (
    <View style={s.container}>
      {alertElement}
      <ScreenHeader
        title={T.deletedCategories}
        subtitle="30 gün sonra kalıcı olarak silinecek"
        onBack={() => navigation.goBack()}
        variant="deleted"
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#FF6B00" size="large" />
        </View>
      ) : deletedCategories.length === 0 ? (
        <View style={s.center}>
          <Zap size={40} color="#9CA3AF" style={{ marginBottom: 16 }} />
          <Text style={s.emptyText}>{T.noDeletedCategories}</Text>
        </View>
      ) : (
        <FlatList
          data={deletedCategories}
          keyExtractor={c => c.id}
          contentContainerStyle={s.list}
          renderItem={({ item: category }) => {
            const Icon = iconMap[category.icon] || Trash2;
            return (
              <View style={[s.card, { borderLeftColor: category.color, borderLeftWidth: 4 }]}>
                <View style={s.cardContent}>
                  <View style={[s.iconBg, { backgroundColor: category.color + '15' }]}>
                    <Icon size={20} color={category.color} />
                  </View>
                  <View style={s.info}>
                    <Text style={s.catName}>{category.name}</Text>
                    <Text style={s.catType}>{category.type}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={s.restoreBtn}
                  onPress={() => handleRestore(category.id, category.name)}
                >
                  <Undo2 size={16} color="#10B981" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:     { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
  list:          { padding: 16, paddingBottom: 32 },
  card:          { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardContent:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBg:        { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  info:          { flex: 1 },
  catName:       { ...Typography.label, color: Colors.textDark, marginBottom: Spacing.xs },
  catType:       { ...Typography.caption, color: Colors.textMuted },
  restoreBtn:    { padding: 8 },
});
