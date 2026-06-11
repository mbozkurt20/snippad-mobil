// Keyboard Theme — Ember Only
// Premium dark orange theme

export interface KTheme {
  name: string;
  key: string;
  // Color properties
  kbBg?: string;
  keyBg?: string;
  keyTxt?: string;
  specBg?: string;
  specTxt?: string;
  accentBg?: string;
  accentTxt?: string;
  dockBg?: string;
  tplBg?: string;
  tplItemBg?: string;
  tplTxt?: string;
  tplSub?: string;
}

// EMBER — Cosmic Orange
export const EMBER_THEME: KTheme = {
  key: 'ember',
  name: 'Ember',
  kbBg: '#0C0804',
  keyBg: '#1A1208',
  keyTxt: '#F2E8DE',
  specBg: '#2C2210',
  specTxt: '#F2E8DE',
  accentBg: '#C4570A',
  accentTxt: '#FFFFFF',
  dockBg: '#0C0804',
  tplBg: '#141008',
  tplItemBg: '#1A1208',
  tplTxt: '#F2E8DE',
  tplSub: '#B89070',
};

// TANGERINE — Bright Vibrant Orange
export const TANGERINE_THEME: KTheme = {
  key: 'tangerine',
  name: 'Tangerine',
  kbBg: '#0D0D0D',
  keyBg: '#FF6B1A',
  keyTxt: '#FFFFFF',
  specBg: '#2A2A2A',
  specTxt: '#FFFFFF',
  accentBg: '#FF7A2E',
  accentTxt: '#FFFFFF',
  dockBg: '#0D0D0D',
  tplBg: '#151515',
  tplItemBg: '#1F1F1F',
  tplTxt: '#FFFFFF',
  tplSub: '#888888',
};

// Theme collection
export const THEMES: KTheme[] = [
  EMBER_THEME,
  TANGERINE_THEME,
];

export const cornerRadiusFor = (theme: KTheme): number => 10;

// Lookup function — find theme by key
export function themeByKey(key: string): KTheme {
  return THEMES.find(t => t.key === key) || EMBER_THEME;
}
