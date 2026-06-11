import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, PanResponder, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator, Image, ScrollView, Platform, Animated, GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { ChevronLeft, RotateCcw, Trash2, Download, Copy, Image as ImageIcon } from 'lucide-react-native';
import { Colors } from '../theme';
import { mmkvStorage } from '../store/storage';
import { SavedSignature } from '../types';
import 'react-native-get-random-values';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

const COLORS = ['#000000', '#FFFFFF', '#C0392B'];

type PathEntry = { d: string; width: number; color: string };
type Tab = 'draw' | 'paste' | 'saved';
type SignatureType = 'drawn' | 'pasted';

export default function SignatureDrawer({ navigation, route }: any) {
  const svgRef = useRef<Svg>(null);
  const containerRef = useRef<View>(null);

  // Tab & UI state
  const [tab, setTab] = useState<Tab>('draw');
  const [saving, setSaving] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [sigs, setSigs] = useState<SavedSignature[]>(() => {
    try {
      return mmkvStorage.getSignatures();
    } catch (e) {
      console.error('[SignatureDrawer] Error loading signatures:', e);
      return [];
    }
  });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 170 });

  // Draw mode
  const [paths, setPaths] = useState<PathEntry[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [strokeColor, setStrokeColor] = useState('#000000');

  // Paste mode - draggable & resizable imza
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [imageDragPos, setImageDragPos] = useState({ x: 10, y: 10 });
  const [imageSize, setImageSize] = useState({ width: 140, height: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const handleContainerLayout = useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.measure((x, y, width, height) => {
      setCanvasSize({ width, height });
    });
  }, []);

  // Refresh saved signatures when tab is 'saved' or when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (tab === 'saved') {
        try {
          setSigs(mmkvStorage.getSignatures());
        } catch (e) {
          console.error('[SignatureDrawer] Error refreshing signatures:', e);
        }
      }
    }, [tab])
  );

  // ── PanResponder for drawing ──────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => tab === 'draw',
      onMoveShouldSetPanResponder: () => tab === 'draw',
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        if (locationX !== undefined && locationY !== undefined) {
          setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
        }
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        if (locationX !== undefined && locationY !== undefined) {
          setCurrentPath(prev => `${prev} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
        }
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          setPaths(ps => [...ps, { d: currentPath, width: 3, color: strokeColor }]);
          setCurrentPath('');
        }
      },
    })
  ).current;

  // ── Image gesture handlers ────────────────────────────────────────────────
  const imageResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!pastedImage && tab === 'paste',
      onMoveShouldSetPanResponder: () => !!pastedImage && tab === 'paste',
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDragStartPos({ x: locationX, y: locationY });

        // Check if clicking on resize corner (bottom-right)
        const cornerX = imageDragPos.x + imageSize.width;
        const cornerY = imageDragPos.y + imageSize.height;
        if (Math.abs(locationX - cornerX) < 30 && Math.abs(locationY - cornerY) < 30) {
          setIsResizing(true);
        } else {
          setIsDragging(true);
        }
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const deltaX = locationX - dragStartPos.x;
        const deltaY = locationY - dragStartPos.y;

        if (isDragging) {
          setImageDragPos({
            x: Math.max(0, Math.min(imageDragPos.x + deltaX, canvasSize.width - imageSize.width)),
            y: Math.max(0, Math.min(imageDragPos.y + deltaY, canvasSize.height - imageSize.height)),
          });
          setDragStartPos({ x: locationX, y: locationY });
        } else if (isResizing) {
          const newWidth = Math.max(60, imageSize.width + deltaX);
          const newHeight = Math.max(30, imageSize.height + deltaY);
          setImageSize({ width: newWidth, height: newHeight });
          setDragStartPos({ x: locationX, y: locationY });
        }
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        setIsResizing(false);
      },
    })
  ).current;

  const undo = useCallback(() => setPaths(ps => ps.slice(0, -1)), []);
  const reset = useCallback(() => {
    setPaths([]);
    setCurrentPath('');
  }, []);

  // ── Get base64 from draw canvas ───────────────────────────────────────────
  const getBase64 = (): Promise<string | null> =>
    new Promise(resolve => {
      if (!svgRef.current) { resolve(null); return; }
      (svgRef.current as any).toDataURL((b64: string) => resolve(b64 || null));
    });

  // ── Get base64 from paste canvas (with image) ────────────────────────────
  const getBase64WithImage = (): Promise<string | null> => {
    // For paste mode, convert the canvas with the pasted image to base64
    // This is simplified - in real app would need image rendering
    return Promise.resolve(pastedImage || null);
  };

  // ── Save signature ────────────────────────────────────────────────────────
  const handleSave = async (name: string, signatureType: SignatureType, base64?: string) => {
    setSaving(true);
    try {
      const b64 = base64 ?? (tab === 'draw' ? await getBase64() : pastedImage);
      if (!b64) {
        Alert.alert('Uyarı', tab === 'draw' ? 'Lütfen imzanızı çizin' : 'Lütfen bir resim seçin');
        return;
      }

      const id = uuidv4();
      const dir = FileSystem.documentDirectory + 'signatures/';
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const filePath = dir + id + '.png';
      const cleanBase64 = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
      await FileSystem.writeAsStringAsync(filePath, cleanBase64, { encoding: 'base64' as any });

      const now = new Date().toISOString();
      const sig: SavedSignature = {
        id,
        name,
        imagePath: filePath,
        base64: b64,
        createdAt: now,
        type: signatureType,
        timestamp: now,
        deviceInfo: `${Platform.OS}`,
      };

      const existing = mmkvStorage.getSignatures();
      const editId = route?.params?.editId;
      const updated = editId
        ? existing.map(s => s.id === editId ? { ...sig, id: editId } : s)
        : [...existing, sig];

      mmkvStorage.setSignatures(updated);
      setSigs(mmkvStorage.getSignatures());
      setTab('saved');
      reset();
      setPastedImage(null);
    } catch (e: any) {
      Alert.alert('Hata', 'İmza kaydedilemedi: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Paste from clipboard ──────────────────────────────────────────────────
  const handleClipboardPaste = async () => {
    setPasting(true);
    try {
      // @ts-ignore — Expo Clipboard API signature differs in v54
      const image = await Clipboard.getImageAsync();
      if (!image) {
        Alert.alert('Uyarı', 'Clipboard\'da resim yok');
        return;
      }
      // Clipboard.getImageAsync() returns a string (base64 or data URI)
      setPastedImage(typeof image === 'string' ? image : image.toString());
    } catch (e: any) {
      Alert.alert('Hata', 'Clipboard\'tan okunamadı');
    } finally {
      setPasting(false);
    }
  };

  // ── Pick image from gallery ───────────────────────────────────────────────
  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = (asset as any).base64;
        if (base64) {
          setPastedImage(`data:image/jpeg;base64,${base64}`);
        } else {
          Alert.alert('Uyarı', 'Base64 verisine erişilemedi');
        }
      }
    } catch (e: any) {
      Alert.alert('Hata', 'Resim seçilemedi');
    }
  };

  // ── Delete saved signature ────────────────────────────────────────────────
  const deleteSig = (id: string) => {
    Alert.alert('Sil', 'Bu imzayı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          const updated = sigs.filter(s => s.id !== id);
          mmkvStorage.setSignatures(updated);
          setSigs(updated);
        },
      },
    ]);
  };

  // ── Share/Download signature ──────────────────────────────────────────────
  const handleDownload = async (base64: string) => {
    setSaving(true);
    try {
      const path = FileSystem.cacheDirectory + `imza_${Date.now()}.png`;
      const cleanBase64 = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
      await FileSystem.writeAsStringAsync(path, cleanBase64, { encoding: 'base64' as any });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'image/png', dialogTitle: 'İmzayı Kaydet' });
      } else {
        Alert.alert('Bilgi', 'Paylaşım bu cihazda desteklenmiyor.');
      }
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Hata', 'Kaydedilemedi.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ChevronLeft size={20} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.title}>İmzalar</Text>
        <View style={{ flex: 1 }} />

        {/* Tabs */}
        <View style={s.tabs}>
          {(['draw', 'paste', 'saved'] as Tab[]).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tabBtn, tab === t && s.tabBtnActive]}>
              <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
                {t === 'draw' ? 'Çiz' : t === 'paste' ? 'Yapıştır' : 'Kayıtlı'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tab === 'draw' ? (
        /* ── DRAW MODE ────────────────────────────────────────────────────── */
        <>
          {/* Canvas - luxury paper design */}
          <View
            ref={containerRef}
            style={s.canvas}
            onLayout={handleContainerLayout}
            {...panResponder.panHandlers}
          >
            {canvasSize.width > 0 && (
              <Svg
                ref={svgRef}
                style={StyleSheet.absoluteFill}
                width={canvasSize.width}
                height={canvasSize.height}
                viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              >
                {/* Background */}
                <rect width={canvasSize.width} height={canvasSize.height} fill="#F5F3F0" />

                {/* Signature line at bottom */}
                <Line
                  x1="16"
                  y1={canvasSize.height - 15}
                  x2={canvasSize.width - 16}
                  y2={canvasSize.height - 15}
                  stroke="#D0C4B8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* Border */}
                <rect
                  width={canvasSize.width}
                  height={canvasSize.height}
                  fill="none"
                  stroke="#E8DDD0"
                  strokeWidth="1"
                />

                {/* Drawn paths */}
                {paths.map((p, i) => (
                  <Path
                    key={i}
                    d={p.d}
                    stroke={p.color}
                    strokeWidth={p.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke={strokeColor}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
            )}
            {paths.length === 0 && <Text style={s.placeholder}>Parmağınızla imzanızı çizin…</Text>}
          </View>

          {/* Toolbar */}
          <View style={s.toolbar}>
            {/* Colors */}
            <View style={s.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setStrokeColor(c)}
                  style={[
                    s.colorDot,
                    { backgroundColor: c },
                    c === '#FFFFFF' && s.colorDotWhite,
                    strokeColor === c && s.colorDotActive,
                  ]}
                />
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={undo} style={s.toolBtn}>
              <RotateCcw size={17} color={Colors.textGray} />
            </TouchableOpacity>
            <TouchableOpacity onPress={reset} style={s.toolBtn}>
              <Trash2 size={17} color={Colors.textGray} />
            </TouchableOpacity>
          </View>

          {/* Action buttons */}
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnOutline]}
              onPress={() => handleDownload(paths.length > 0 ? 'drawn' : '')}
              disabled={saving || paths.length === 0}
            >
              <Download size={15} color={Colors.textDark} />
              <Text style={s.actionBtnOutlineTxt}>PNG Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnFill]}
              onPress={() => {
                if (paths.length === 0) {
                  Alert.alert('Uyarı', 'Önce imzanızı çizin.');
                  return;
                }
                setNameDraft('');
                setNameModal(true);
              }}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.actionBtnFillTxt}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : tab === 'paste' ? (
        /* ── PASTE MODE ───────────────────────────────────────────────────── */
        <>
          {/* Canvas for pasted image */}
          <View style={s.canvas} {...imageResponder.panHandlers}>
            {pastedImage ? (
              <>
                <Image
                  source={{ uri: pastedImage }}
                  style={[
                    s.pastedImg,
                    {
                      position: 'absolute',
                      left: imageDragPos.x,
                      top: imageDragPos.y,
                      width: imageSize.width,
                      height: imageSize.height,
                    },
                  ]}
                  resizeMode="contain"
                />
                {/* Resize handle */}
                <View
                  style={[
                    s.resizeHandle,
                    {
                      position: 'absolute',
                      right: canvasSize.width - imageDragPos.x - imageSize.width + 8,
                      bottom: canvasSize.height - imageDragPos.y - imageSize.height + 8,
                    },
                  ]}
                />
              </>
            ) : (
              <Text style={s.placeholder}>Resim seçmek için aşağıdan başlayın</Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnOutline]}
              onPress={handleClipboardPaste}
              disabled={pasting}
            >
              {pasting ? (
                <ActivityIndicator color={Colors.textDark} size="small" />
              ) : (
                <>
                  <Copy size={15} color={Colors.textDark} />
                  <Text style={s.actionBtnOutlineTxt}>Clipboard</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnFill]}
              onPress={handleImagePicker}
              disabled={pasting}
            >
              {pasting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <ImageIcon size={15} color="#fff" />
                  <Text style={s.actionBtnFillTxt}>Galeri</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Save button */}
          {pastedImage && (
            <TouchableOpacity
              style={s.saveBtn}
              onPress={() => {
                setNameDraft('');
                setNameModal(true);
              }}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.saveBtnTxt}>Kaydet</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      ) : (
        /* ── SAVED MODE ───────────────────────────────────────────────────── */
        <ScrollView contentContainerStyle={s.savedList}>
          {sigs.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>✍️</Text>
              <Text style={s.emptyTxt}>Henüz imza kaydedilmedi</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => setTab('draw')}>
                <Text style={s.emptyBtnTxt}>İlk imzamı çiz</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sigs.map(sig => (
              <View key={sig.id} style={s.sigCard}>
                <Image
                  source={{ uri: sig.base64.includes('data:') ? sig.base64 : `data:image/png;base64,${sig.base64}` }}
                  style={s.sigPreview}
                  resizeMode="contain"
                />
                <View style={s.sigCardBottom}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sigName} numberOfLines={1}>
                      {sig.name}
                    </Text>
                    <Text style={s.sigType}>
                      {sig.type === 'drawn' ? '🎨 El çizimi' : '📎 Yapıştırılan'}
                    </Text>
                  </View>
                  <View style={s.sigCardActions}>
                    <TouchableOpacity
                      onPress={() => handleDownload(sig.base64)}
                      style={s.sigActionBtn}
                    >
                      <Download size={14} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteSig(sig.id)}
                      style={s.sigActionBtn}
                    >
                      <Trash2 size={14} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Save Modal */}
      <Modal visible={nameModal} transparent animationType="fade" onRequestClose={() => setNameModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>İmzaya bir ad verin</Text>
            <TextInput
              style={s.modalInput}
              placeholder="örn. Resmi İmzam"
              placeholderTextColor={Colors.textLight}
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              maxLength={50}
            />
            <View style={s.modalBtns}>
              <TouchableOpacity onPress={() => setNameModal(false)} style={s.modalCancel}>
                <Text style={s.modalCancelTxt}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setNameModal(false);
                  handleSave(nameDraft.trim() || 'İmzam', tab === 'draw' ? 'drawn' : 'pasted');
                }}
                style={s.modalOk}
              >
                <Text style={s.modalOkTxt}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  tabs: {
    flexDirection: 'row',
    gap: 4,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabTxt: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  tabTxtActive: {
    color: '#fff',
  },

  /* Canvas */
  canvas: {
    height: 170,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3F0',
  },
  placeholder: {
    color: '#999',
    fontSize: 14,
    pointerEvents: 'none',
  } as any,
  pastedImg: {
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  resizeHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },

  /* Toolbar */
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotWhite: {
    borderColor: '#555',
  },
  colorDotActive: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
    transform: [{ scale: 1.15 }],
  },
  toolBtn: {
    padding: 8,
  },

  /* Actions */
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  actionBtnFill: {
    backgroundColor: Colors.primary,
  },
  actionBtnOutlineTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  actionBtnFillTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  saveBtn: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  /* Saved list */
  savedList: {
    padding: 12,
    gap: 10,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTxt: {
    fontSize: 14,
    color: Colors.textLight,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  emptyBtnTxt: {
    color: '#fff',
    fontWeight: '600',
  },
  sigCard: {
    backgroundColor: Colors.cardLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sigPreview: {
    width: '100%',
    height: 90,
    backgroundColor: '#fff',
  },
  sigCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  sigName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  sigType: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  sigCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sigActionBtn: {
    padding: 6,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: Colors.cardLight,
    borderRadius: 16,
    padding: 20,
    width: 300,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelTxt: {
    color: Colors.textLight,
    fontSize: 14,
  },
  modalOk: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalOkTxt: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
