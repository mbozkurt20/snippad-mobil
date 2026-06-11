import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { X, CreditCard, MapPin, FileText, Pencil, Key, Hash, Truck, Link2, Mail, Lock, Phone } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import type { Category, CategoryType } from '../types';
import { PLAN_LIMITS } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useT } from '../i18n';

const iconOptions: { key: string; Icon: React.ComponentType<any> }[] = [
  { key: 'file-text', Icon: FileText },
  { key: 'bank',      Icon: CreditCard },
  { key: 'map-pin',   Icon: MapPin },
  { key: 'key',       Icon: Key },
  { key: 'hash',      Icon: Hash },
  { key: 'truck',     Icon: Truck },
  { key: 'link',      Icon: Link2 },
  { key: 'mail',      Icon: Mail },
  { key: 'phone',     Icon: Phone },
];

type Props = {
  visible: boolean;
  editCategory?: Category | null;
  onClose: () => void;
  onAdd: (name: string, type: CategoryType, icon: string, color: string) => void;
  onUpdate?: (id: string, name: string, type: CategoryType, icon: string, color: string) => void;
};

export default function AddCategoryModal({ visible, editCategory, onClose, onAdd, onUpdate }: Props) {
  const T = useT();
  const { userSettings } = useAppStore();

  const typeOptions: { key: CategoryType; label: string; Icon: React.ComponentType<any>; desc: string }[] = [
    { key: 'text',     label: T.typeText,     Icon: FileText,   desc: T.typeTextDesc },
    { key: 'iban',     label: T.typeIban,     Icon: CreditCard, desc: T.typeIbanDesc },
    { key: 'address',  label: T.typeAddress,  Icon: MapPin,     desc: T.typeAddressDesc },
    { key: 'password', label: T.typePassword, Icon: Key,        desc: T.typePasswordDesc },
    { key: 'cargo',    label: T.typeCargo,    Icon: Truck,      desc: T.typeCargoDesc },
    { key: 'link',     label: T.typeLink,     Icon: Link2,      desc: T.typeLinkDesc },
    { key: 'email',    label: T.typeEmail,    Icon: Mail,       desc: T.typeEmailDesc },
    { key: 'phone',    label: T.typePhone,    Icon: Phone,      desc: T.typePhoneDesc },
  ];

  const { categories } = useAppStore();
  const planLimits = PLAN_LIMITS[userSettings.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.basic;
  const typeLimit = planLimits.categoryTypes === -1 ? typeOptions.length : planLimits.categoryTypes;

  // Kullanıcının sahip olduğu kategori tiplerini say
  const usedTypes = new Set(categories.map(c => c.type));
  const availableTypes = typeOptions.filter(opt => usedTypes.has(opt.key) || usedTypes.size < typeLimit);

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('text');
  const [icon, setIcon] = useState('file-text');
  const [colorIndex, setColorIndex] = useState(0);
  const nameInputRef = useRef<TextInput>(null);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setType(editCategory.type);
      setIcon(editCategory.icon);
      const idx = Colors.categoryColors.indexOf(editCategory.color);
      setColorIndex(idx >= 0 ? idx : 0);
    } else {
      setName(''); setType('text'); setIcon('file-text'); setColorIndex(0);
    }
  }, [editCategory, visible]);

  // Auto-select matching icon when type changes
  const handleTypeChange = (t: CategoryType) => {
    setType(t);
    if (t === 'iban')     setIcon('bank');
    if (t === 'address')  setIcon('map-pin');
    if (t === 'password') setIcon('key');
    if (t === 'cargo')    setIcon('truck');
    if (t === 'link')     setIcon('link');
    if (t === 'email')    setIcon('mail');
    if (t === 'phone')    setIcon('phone');
    if (t === 'text')     setIcon('file-text');
  };

  const isEdit = !!editCategory;

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (isEdit && onUpdate) {
      onUpdate(editCategory.id, name.trim(), type, icon, Colors.categoryColors[colorIndex]);
    } else {
      onAdd(name.trim(), type, icon, Colors.categoryColors[colorIndex]);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView style={s.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>{isEdit ? T.editCategoryTitle : T.newCategoryTitle}</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={Colors.textGray} /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.label}>{T.categoryNameSection}</Text>
            <View style={s.inputRow}>
              <TextInput
                ref={nameInputRef}
                style={s.input}
                placeholder={T.categoryNamePlaceholder}
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={handleNameChange}
                maxLength={30}
                selectTextOnFocus
              />
              <Pencil size={16} color={Colors.textLight} style={s.inputIcon} />
            </View>

            <Text style={s.label}>{T.categoryTypeSection}</Text>
            <View style={s.typeGrid}>
              {typeOptions.map((opt) => {
                const active = type === opt.key;
                const isAvailable = availableTypes.find(t => t.key === opt.key);
                const locked = !isAvailable;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[s.typeBtn, active && s.typeBtnActive, locked && s.typeBtnLocked]}
                    onPress={() => { if (!locked) handleTypeChange(opt.key); }}>
                    {locked
                      ? <Lock size={16} color={Colors.textLight} />
                      : <opt.Icon size={18} color={active ? Colors.white : Colors.textGray} />
                    }
                    <Text style={[s.typeBtnText, active && s.typeBtnTextActive, locked && { color: Colors.textLight }]}>{opt.label}</Text>
                    {locked
                      ? <Text style={[s.typeDesc, { color: Colors.textLight }]}>{T.upgradeType}</Text>
                      : <Text style={[s.typeDesc, active && s.typeDescActive]}>{opt.desc}</Text>
                    }
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.label}>{T.iconSection}</Text>
            <View style={s.row}>
              {iconOptions.map(opt => {
                const active = icon === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[s.iconBtn, active && s.iconBtnActive]}
                    onPress={() => setIcon(opt.key)}>
                    <opt.Icon size={22} color={active ? Colors.primary : Colors.textGray} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.label}>{T.colorSection}</Text>
            <View style={s.colorRow}>
              {Colors.categoryColors.map((c, i) => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorDot, { backgroundColor: c }, colorIndex === i && s.colorDotActive]}
                  onPress={() => setColorIndex(i)} />
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[s.addBtn, !name.trim() && s.addBtnDisabled]}
            onPress={handleSubmit} disabled={!name.trim()}>
            <Text style={s.addBtnText}>{isEdit ? T.updateCategoryBtn : T.addCategoryBtn}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + Spacing.lg, maxHeight: '92%',
  },
  handle: {
    width: 40, height: 4, borderRadius: BorderRadius.full, backgroundColor: Colors.border,
    alignSelf: 'center', marginTop: Spacing.sm, marginBottom: Spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { ...Typography.h2, color: Colors.textDark },
  label: { ...Typography.label, color: Colors.textLight, marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 0.8 },
  inputRow: { position: 'relative' },
  input: {
    backgroundColor: Colors.cardLight, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, paddingRight: 40,
    ...Typography.body, color: Colors.textDark,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -8,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: {
    width: '48%', paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md, backgroundColor: Colors.cardLight,
    borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', gap: 4,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnLocked: { opacity: 0.45, backgroundColor: Colors.background },
  typeBtnText: { ...Typography.label, color: Colors.textGray, fontWeight: '700' },
  typeBtnTextActive: { color: Colors.white },
  typeDesc: { ...Typography.label, color: Colors.textLight, textAlign: 'center' },
  typeDescActive: { color: 'rgba(255,255,255,0.8)' },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  iconBtn: {
    width: 52, height: 52, borderRadius: BorderRadius.md, backgroundColor: Colors.cardLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent',
  },
  iconBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: BorderRadius.full },
  colorDotActive: { borderWidth: 3, borderColor: Colors.primary },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md + 2, alignItems: 'center', marginTop: Spacing.xl,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { ...Typography.h3, color: Colors.white },
});
