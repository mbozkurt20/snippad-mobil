import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Modal } from 'react-native';
import { X, Copy, Trash2, Share2 } from 'lucide-react-native';
import { useLogger } from '../utils/logger';
import { Colors } from '../theme';
import * as Clipboard from 'expo-clipboard';

export default function LogViewer() {
  const [visible, setVisible] = useState(false);
  const { logs, clearLogs, exportLogs } = useLogger();

  const handleCopy = async () => {
    const text = exportLogs();
    await Clipboard.setStringAsync(text);
  };

  const handleShare = async () => {
    try {
      const text = exportLogs();
      await Share.share({
        message: text,
        title: 'App Logs',
      });
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={s.fabText}>📋</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
              <Text style={s.title}>Uygulama Logları ({logs.length})</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <X size={20} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            {/* Logs */}
            <ScrollView
              style={s.logScroll}
              contentContainerStyle={s.logContent}
              showsVerticalScrollIndicator={true}
            >
              {logs.length === 0 ? (
                <Text style={s.emptyText}>Henüz log yok</Text>
              ) : (
                logs.map((log, idx) => (
                  <View key={idx} style={[s.logEntry, s[`log${log.level}`]]}>
                    <Text style={s.logTime}>{log.timestamp}</Text>
                    <Text style={s.logLevel}>[{log.level.toUpperCase()}]</Text>
                    <Text style={s.logMsg}>{log.message}</Text>
                    {log.data && (
                      <Text style={s.logData}>{JSON.stringify(log.data)}</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity
                style={[s.btn, s.btnSecondary]}
                onPress={handleCopy}
              >
                <Copy size={14} color={Colors.primary} />
                <Text style={s.btnText}>Kopyala</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, s.btnSecondary]}
                onPress={handleShare}
              >
                <Share2 size={14} color={Colors.primary} />
                <Text style={s.btnText}>Paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, s.btnDanger]}
                onPress={() => {
                  clearLogs();
                  setVisible(false);
                }}
              >
                <Trash2 size={14} color="#fff" />
                <Text style={s.btnTextDanger}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  fabText: {
    fontSize: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  logScroll: {
    flex: 1,
  },
  logContent: {
    padding: 12,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: 20,
  },
  logEntry: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  loginfo: {
    backgroundColor: '#E0F2FE',
  },
  lognav: {
    backgroundColor: '#DBEAFE',
  },
  logwarn: {
    backgroundColor: '#FEF3C7',
  },
  logerror: {
    backgroundColor: '#FEE2E2',
  },
  logTime: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 2,
  },
  logLevel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  logMsg: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '500',
  },
  logData: {
    fontSize: 10,
    color: Colors.textGray,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: Colors.cardLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnDanger: {
    backgroundColor: '#EF4444',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  btnTextDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
