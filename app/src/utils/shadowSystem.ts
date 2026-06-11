/**
 * 3-layer shadow depth system for Ember keyboard
 * Inspired by HTML design: heavy bottom shadow + subtle inset
 * Creates tactile "pressed" and "raised" sensations
 */

import { colors, shadowColors } from '../theme/designTokens';

export const SHADOWS = {
  // Default key shadow — HTML style: heavy bottom + inset
  // 0 2px 0 rgba(0,0,0,0.5) + inset 0 1px 0 rgba(255,255,255,0.05)
  keyDefault: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.50,    // Heavy shadow (matches HTML)
    shadowRadius: 0,        // No blur — sharp drop
    elevation: 3,           // Android equivalent
  },

  // Special keys (SHIFT, DEL, NUM) — same as default
  keySpecial: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.50,    // Heavy shadow
    shadowRadius: 0,        // Sharp
    elevation: 3,
  },

  // Accent key (ENTER) — darker shadow (HTML: rgba(120,40,0,0.8))
  keyAccent: {
    shadowColor: shadowColors.accentDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.80,    // Very strong
    shadowRadius: 0,        // Sharp like HTML
    elevation: 4,
  },

  // Pressed state — shadow disappears (2px lift → 0px)
  keyPressed: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 0 }, // No shadow when pressed
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Minimal elevation = pressed down
  },

  // Dock buttons — minimal shadow
  dockButton: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 1,
  },

  // Template card shadows
  templateCard: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 1,
  },
};

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}
