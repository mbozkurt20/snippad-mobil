import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Users, UserPlus, Trash2, X } from 'lucide-react-native';
import { SettingsStackParamList } from '../types';
import { TeamMember, TeamRole } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useAlert } from '../components/CustomAlert';
import ScreenHeader from '../components/ScreenHeader';
import { useT } from '../i18n';
import { api } from '../store/api';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useLogger } from '../utils/logger';

type Props = { navigation: NativeStackNavigationProp<SettingsStackParamList, 'Team'> };

const ROLE_COLORS: Record<TeamRole, string> = {
  owner:  '#F59E0B',
  admin:  '#8B5CF6',
  editor: '#10B981',
  viewer: '#6B7280',
};

export default function TeamScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const T = useT();
  const { showAlert } = useAlert();
  const { addLog } = useLogger();
  const subscription = useAppStore(s => s.userSettings.subscription);
  const plan         = useAppStore(s => s.userSettings.plan);
  const getPlanLimits = useAppStore(s => s.getPlanLimits);
  const teamMembership = useAppStore(s => s.teamMembership);
  const userRole = teamMembership?.role as TeamRole | undefined;

  const ROLE_LABELS: Record<TeamRole, string> = {
    owner:  T.roleOwner,
    admin:  T.roleAdmin,
    editor: T.roleEditor,
    viewer: T.roleViewer,
  };
  // Check planLimits (contactsIntegration) as primary source + fallback to subscription/plan strings
  const BUSINESS_PLANS = ['business', 'business_yearly', 'ultra_pro', 'ultra_pro_yearly'];
  const isBusiness =
    getPlanLimits().contactsIntegration ||
    BUSINESS_PLANS.includes(plan ?? '') ||
    BUSINESS_PLANS.includes(subscription?.planId ?? '');

  const teamLimits = getPlanLimits().teamLimits;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    // addLog('nav', '📋 Team Screen Loaded', {
    //   isBusiness,
    //   plan,
    //   subscriptionPlan: subscription?.planId,
    //   userRole,
    //   canManageTeam: userRole === 'owner' || userRole === 'admin',
    // });
  }, []);

  // Rol bazlı mevcut sayılar
  const countByRole = (role: TeamRole) => members.filter(m => m.role === role).length;
  const limitForRole = (role: TeamRole): number => teamLimits?.[role] ?? 0;
  const isRoleFull = (role: TeamRole) => {
    const limit = limitForRole(role);
    return limit !== -1 && countByRole(role) >= limit;
  };
  const canInvite = teamLimits != null && !isRoleFull(inviteRole);

  // Permission kontrol
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';
  const isViewer = userRole === 'viewer';

  // Owner/Admin/Editor invite yapabilir, Viewer yapamaz
  const canManageTeam = isOwner || isAdmin || isEditor;

  // Owner/Admin delete ve role update yapabilir, Editor yapamaz
  const canDeleteMembers = isOwner || isAdmin;
  const canChangeRoles = isOwner || isAdmin;

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      // addLog('info', '📥 Loading team members...');
      const res = await api.get<any>('/team/members');
      setMembers(res.members ?? []);
      // addLog('info', `✅ Loaded ${res.members?.length ?? 0} members`);
    } catch (e: any) {
      // addLog('error', '❌ Failed to load members', e?.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      showAlert({ title: T.error, message: T.invalidEmail, buttons: [{ text: T.ok, style: 'default' }] });
      return;
    }
    if (!canInvite) {
      const limit = limitForRole(inviteRole);
      showAlert({ title: 'Limit Doldu', message: `${ROLE_LABELS[inviteRole]} rolü için maksimum ${limit} kişi eklenebilir.`, buttons: [{ text: T.ok, style: 'default' }] });
      return;
    }
    setInviting(true);
    try {
      await api.post('/team/invite', { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail('');
      showAlert({ title: T.inviteSent, message: T.inviteSentDesc(inviteEmail), buttons: [{ text: T.ok, style: 'default' }] });
      loadMembers();
    } catch (e: any) {
      showAlert({ title: T.error, message: e?.message ?? T.inviteFailed, buttons: [{ text: T.ok, style: 'default' }] });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = (member: TeamMember) => {
    if (member.role === 'owner') return;
    showAlert({
      title: T.removeMemberTitle,
      message: T.removeMemberConfirm(member.name),
      buttons: [
        { text: T.cancel, style: 'cancel' },
        {
          text: T.remove, style: 'destructive', onPress: async () => {
            // Optimistik güncelleme — hem filtrele hem yeniden yükle
            setMembers(prev => prev.filter(m => m.id !== member.id));
            try {
              await api.delete(`/team/members/${member.id}`);
              await loadMembers(); // Backend ile sync et
            } catch {
              await loadMembers(); // Hata olursa orijinal listeyi geri al
              showAlert({ title: T.error, message: T.memberRemoveFailed, buttons: [{ text: T.ok, style: 'default' }] });
            }
          },
        },
      ],
    });
  };

  if (!isBusiness) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.title}>{T.teamManagementTitle}</Text>
        </View>
        <View style={styles.upgradeBox}>
          <Users size={40} color="#F59E0B" style={{ marginBottom: 12 }} />
          <Text style={styles.upgradeTitle}>{T.businessRequired}</Text>
          <Text style={styles.upgradeText}>{T.businessRequiredDesc}</Text>
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={styles.upgradeBtnText}>{T.upgradePlanBtn}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title={T.teamManagementTitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 8) + 32 }}>
        {/* Viewer ise yönetim seçeneği yok */}
        {isViewer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Erişim Seviyesi</Text>
            <Text style={styles.emptyText}>📖 Viewer rolü: Paketleri ve şablonları görebilir ve kullanabilirsiniz, ancak yeni kategori/üye ekleyemezsiniz.</Text>
          </View>
        )}

        {/* Invite section — sadece owner/admin */}
        {canManageTeam && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.inviteMember}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={T.email}
              placeholderTextColor="#6B7280"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.roleRow}>
            {(['editor', 'admin', 'viewer'] as TeamRole[]).map(role => {
              const full = isRoleFull(role);
              const limit = limitForRole(role);
              const count = countByRole(role);
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    inviteRole === role && { backgroundColor: ROLE_COLORS[role] + '33', borderColor: ROLE_COLORS[role] },
                    full && { opacity: 0.45 },
                  ]}
                  onPress={() => setInviteRole(role)}
                >
                  <Text style={[styles.roleChipText, inviteRole === role && { color: ROLE_COLORS[role] }]}>
                    {ROLE_LABELS[role]}
                  </Text>
                  {limit > 0 && (
                    <Text style={[styles.roleChipCount, full && { color: '#EF4444' }]}>
                      {count}/{limit}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.inviteBtn, !canInvite && { opacity: 0.5 }]}
            onPress={handleInvite}
            disabled={inviting || !canInvite}
          >
            {inviting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <UserPlus size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.inviteBtnText}>
                  {canInvite ? T.sendInvite : 'Limit Doldu'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        )}

        {/* Members list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{T.teamMembersCount(members.length)}</Text>
          {loading ? (
            <ActivityIndicator color="#10B981" style={{ marginTop: 16 }} />
          ) : members.length === 0 ? (
            <Text style={styles.emptyText}>{T.noTeamMembers}</Text>
          ) : (
            <>
            {members.slice(0, 5).map(member => (
              <View key={member.id}>
                <View style={styles.memberRow}>
                  <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[member.role] + '22' }]}>
                    <Text style={[styles.avatarText, { color: ROLE_COLORS[member.role] }]}>
                      {member.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[member.role] + '22' }]}>
                    <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[member.role] }]}>
                      {ROLE_LABELS[member.role]}
                    </Text>
                  </View>
                  {member.role !== 'owner' && canDeleteMembers && (
                    <TouchableOpacity onPress={() => handleRemove(member)} style={styles.removeBtn}>
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                {member.status === 'pending' && (
                  <View style={styles.pendingStatusRow}>
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeTxt}>⏳ Davet Bekleniyor</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  backBtn:        { padding: Spacing.sm, marginRight: Spacing.sm },
  title:          { fontSize: 20, fontWeight: '700', color: Colors.textDark },
  scroll:         { flex: 1 },
  section:        { marginHorizontal: Spacing.lg, marginVertical: Spacing.md, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 0, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  sectionTitle:   { fontSize: 13, fontWeight: '800', color: Colors.textDark, marginBottom: Spacing.md, marginHorizontal: Spacing.lg, textTransform: 'uppercase', letterSpacing: 1 },
  inputRow:       { marginBottom: 10 },
  input:          { backgroundColor: Colors.background, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, color: Colors.textDark, fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  roleRow:        { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  roleChip:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  roleChipText:   { fontSize: 12, color: Colors.textGray, fontWeight: '600' },
  inviteBtn:      { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  inviteBtnText:  { color: Colors.white, fontWeight: '700', fontSize: 14 },
  emptyText:      { color: Colors.textGray, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  memberRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar:         { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 0, flexShrink: 0 },
  avatarText:     { fontSize: 16, fontWeight: '700' },
  memberInfo:     { flex: 1, minWidth: 0 },
  memberName:     { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 3 },
  memberEmail:    { fontSize: 11, color: Colors.textGray },
  roleBadge:      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, marginRight: 0, flexShrink: 0 },
  roleBadgeText:  { fontSize: 11, fontWeight: '700' },
  removeBtn:      { padding: Spacing.sm, marginLeft: Spacing.sm, flexShrink: 0 },
  pendingStatusRow: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pendingBadge:   { backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderWidth: 1, borderColor: Colors.border, alignSelf: 'flex-start' },
  pendingBadgeTxt:{ fontSize: 10, color: Colors.primary, fontWeight: '700' },
  roleChipCount:  { fontSize: 9, color: Colors.textGray, marginTop: 2 },
  upgradeBox:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  upgradeTitle:   { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  upgradeText:    { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  upgradeBtn:     { backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
