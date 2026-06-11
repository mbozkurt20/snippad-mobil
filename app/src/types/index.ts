export type CategoryType = 'text' | 'iban' | 'address' | 'password' | 'cargo' | 'link' | 'email' | 'phone';

export interface ClipboardItem {
  id: string;
  content: string;
  title: string;
  categoryName: string;
  categoryType: CategoryType;
  copiedAt: number;
}

export type TemplateScope = 'personal' | 'team';

export interface Template {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
  scope?: TemplateScope;
  team_id?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_system?: boolean;
  scope?: TemplateScope;
  team_id?: string | null;
  templates: Template[];
}

export interface DefaultCategory {
  id: string | number;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUri?: string;
}

// Subscription tiers (Free & ultra_pro removed — 3-day trial uses Business)
export type PlanId =
  | 'basic'     | 'basic_yearly'
  | 'pro'       | 'pro_yearly'
  | 'business'  | 'business_yearly';

export interface PlanLimits {
  categories: number;       // -1 = unlimited
  templatesPerCat: number;  // -1 = unlimited
  categoryTypes: number;    // -1 = unlimited (first N types from typeOptions list)
  themes: number;           // -1 = unlimited (first N themes from THEMES_ALL list)
  cloudBackup: boolean;
  smartVars: boolean;
  emojiSupport: boolean;
  prioritySupport: boolean;
  contactsIntegration: boolean;
  searchBar: boolean;
  mediaTemplates: boolean;
  smartClipboard: boolean;
  clipboardHistoryLimit: number; // 0 = disabled, -1 = unlimited
  fontSettings: boolean;    // font size + family customization (Pro+)
  signatureText: boolean;   // signature text feature (Business only)
  sectorPacks: boolean;     // sector template packs (Business only)
  teamLimits: { owner: number; admin: number; editor: number; viewer: number } | null; // null = no team feature
}

const NO_TEAM = null;
// owner:1 admin:1 editor:1 viewer:2 (her plan için aynı)
const _BIZ_TEAM     = { owner: 1, admin: 1, editor: 1, viewer: 2 };
const _BIZ_YR_TEAM  = { owner: 1, admin: 1, editor: 1, viewer: 2 };

const _BIZ: PlanLimits = { categories: -1, templatesPerCat: -1, categoryTypes: -1, themes: 20, cloudBackup: true, smartVars: true, emojiSupport: true, prioritySupport: true, contactsIntegration: true, searchBar: true, mediaTemplates: true, smartClipboard: true, clipboardHistoryLimit: 25, fontSettings: true, signatureText: true, sectorPacks: true, teamLimits: _BIZ_TEAM };

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  //                         cat  tpl   catTypes thms  cloud  sVars  emoji  prio   contacts search media  clip   clipLimit  font    sig   sector
  basic:           { categories: 15, templatesPerCat: 20, categoryTypes: 4,  themes: 10, cloudBackup: true,  smartVars: true,  emojiSupport: true,  prioritySupport: false, contactsIntegration: false, searchBar: true,  mediaTemplates: false, smartClipboard: true,  clipboardHistoryLimit: 5,  fontSettings: false, signatureText: false, sectorPacks: true,  teamLimits: NO_TEAM },
  basic_yearly:    { categories: 15, templatesPerCat: 20, categoryTypes: 4,  themes: 6,  cloudBackup: true,  smartVars: true,  emojiSupport: true,  prioritySupport: false, contactsIntegration: false, searchBar: true,  mediaTemplates: false, smartClipboard: true,  clipboardHistoryLimit: 5,  fontSettings: false, signatureText: false, sectorPacks: true,  teamLimits: NO_TEAM },
  pro:             { categories: 50, templatesPerCat: 100, categoryTypes: -1, themes: 10, cloudBackup: true,  smartVars: true,  emojiSupport: true,  prioritySupport: false, contactsIntegration: true,  searchBar: true,  mediaTemplates: false, smartClipboard: true,  clipboardHistoryLimit: 10, fontSettings: true,  signatureText: false, sectorPacks: true,  teamLimits: NO_TEAM },
  pro_yearly:      { categories: 50, templatesPerCat: 100, categoryTypes: -1, themes: 10, cloudBackup: true,  smartVars: true,  emojiSupport: true,  prioritySupport: false, contactsIntegration: true,  searchBar: true,  mediaTemplates: false, smartClipboard: true,  clipboardHistoryLimit: 10, fontSettings: true,  signatureText: false, sectorPacks: true,  teamLimits: NO_TEAM },
  business:        { ..._BIZ, teamLimits: _BIZ_TEAM },
  business_yearly: { ..._BIZ, teamLimits: _BIZ_YR_TEAM },
};

export const PLAN_NAMES: Record<PlanId, { tr: string; en: string }> = {
  basic:            { tr: 'Starter',            en: 'Starter' },
  basic_yearly:     { tr: 'Starter Yıllık',     en: 'Starter Yearly' },
  pro:              { tr: 'Pro',                 en: 'Pro' },
  pro_yearly:       { tr: 'Pro Yıllık',          en: 'Pro Yearly' },
  business:         { tr: 'Business',            en: 'Business' },
  business_yearly:  { tr: 'Business Yıllık',     en: 'Business Yearly' },
};

export interface Subscription {
  planId: PlanId;
  purchasedAt: number | null;   // timestamp
  expiresAt: number | null;     // timestamp, null = lifetime
  refundWindowMs: number;       // 2 days in ms = 172800000
}

// ─── Team / B2B ──────────────────────────────────────────────────────────────

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: number | null;
  status: 'active' | 'pending' | 'invited' | 'suspended';
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  memberCount: number;
  plan: PlanId;
  createdAt: number;
}

export interface TeamInvite {
  email: string;
  role: TeamRole;
}

export const TRIAL_DAYS = 3;
export const TRIAL_MS   = TRIAL_DAYS * 24 * 60 * 60 * 1000;

export interface ReferralStats {
  code: string | null;
  referral_count: number;
  rewards_earned: number;
  pending_rewards: number;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar_url?: string | null;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  created_at: number;
}

export interface UserSettings {
  is_premium: boolean;
  plan: PlanId;
  subscription: Subscription | null;
  usage_count: number;
  user_id: string | null;
  is_logged_in: boolean;
  profile: UserProfile;
  trial_started_at: number | null;
  referral_code: string | null;
  show_filigran?: boolean;
}

export interface EmailPreferences {
  marketing: boolean;
  productUpdates: boolean;
  referralNotifications: boolean;
  newsletter: boolean;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Paywall: undefined;
  TeamInvite: { token: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Paywall: undefined;
};

export interface SavedSignature {
  id: string;
  name: string;
  imagePath: string;
  base64: string;
  createdAt: string;
  type: 'drawn' | 'written' | 'pasted';
  timestamp: string;
  deviceInfo?: string;
}

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Paywall: undefined;
  Profile: undefined;
  HelpSupport: undefined;
  ChangePassword: undefined;
  KeyboardPreview: undefined;
  Permissions: undefined;
  Team: undefined;
  BusinessImport: undefined;
  SignatureManager: undefined;
  SignatureDrawer: { editId?: string };
  SectorPacks: undefined;
  ReferralProgram: undefined;
  EmailPreferences: undefined;
  DeletedCategories: undefined;
  WebSignIn: undefined;
  TemplateManager: undefined;
};

export interface AppFeature {
  id: 'web_signin' | 'template_manager';
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
}
