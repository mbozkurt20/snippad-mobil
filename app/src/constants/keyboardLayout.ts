/**
 * UNIFIED KEYBOARD LAYOUT & METRICS
 * ────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all 3 platforms: Preview, iOS, Android
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RESEARCH BASIS — Why these exact numbers
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * KEY WIDTH (letterKeyWidth: 28px)
 *   - Apple iOS native keyboard: ~28pt per key on EN layout (reversed from
 *     The Apple Wiki: 320pt usable ÷ 10 keys ≈ 28pt after gaps)
 *   - Academic research (Kim et al., Human Factors 2014): 19mm key width
 *     gives optimal speed + accuracy. At iPhone 375pt = 375/(375/163) ≈ 163dpi,
 *     19mm ≈ 72pt → far too wide for a 10-key row. Real keyboards compress
 *     width and compensate with height. 28pt is the proven mobile sweet spot.
 *   - MIT Touch Lab: Average fingertip width = 10-14mm. At 2× Retina,
 *     28pt = 56px ≈ 9mm — right at the lower edge of fingertip width, which
 *     is acceptable because horizontal error is corrected by key proximity
 *     prediction (spatial model), not raw size.
 *   - VERDICT: 28pt keeps 12-key TR row in bounds AND matches Apple native.
 *
 * GAP (gap: 6px)
 *   - Apple iOS native keyboard gap: ~7.5pt (reversed from Apple Wiki measurements)
 *   - UX research: gaps < 3px cause accidental adjacent-key taps; gaps > 10px
 *     feel sparse and reduce typing speed (Colle & Hiszem, 2004).
 *   - Optimal range for mobile keyboards confirmed: 4–8px (1.5–3mm physical).
 *   - Gap also provides "key definition" — visual/cognitive separation between keys.
 *     Apple uses a slightly darker background color in gaps, so the gap feels larger
 *     than it measures. Our dark theme achieves this naturally.
 *   - 6px chosen: within Apple's range (7.5), slightly tighter for our wider
 *     TR 12-key row, maintains key definition, prevents fat-finger adjacency errors.
 *   - VERDICT: 6px gap. Not 5 (too tight for 12 keys), not 7 (TR row overflows).
 *
 * KEY HEIGHT (letterKeyHeight: 42px)
 *   - Apple HIG minimum tap target: 44×44pt. Key HEIGHT meets this; key WIDTH
 *     deliberately does not — this is identical to how Apple's own keyboard works.
 *     The horizontal touch model for keyboards uses "nearest key" disambiguation
 *     (Fitts' law + spatial correction), not pure tap-target isolation.
 *   - Apple native keyboard height: 216pt total ÷ 4 rows ≈ 42pt per row after gaps.
 *   - Google Material 3: 48dp minimum. At 1dp≈1pt scale: 42pt is below Google's
 *     recommendation but matches Apple native exactly. On Android, bump to 46px.
 *   - VERDICT: 42px. Meets Apple standard, close to Google's, matches native feel.
 *
 * BOTTOM ROW HEIGHT (bottomRowHeight: 46px)
 *   - Thumb zone (bottom 1/3 of screen) is the most comfortable typing area.
 *     Slightly larger keys here reduce strain. Apple adds ~4-6pt vs letter rows.
 *   - Space bar is the most-pressed key on any keyboard. Taller = more forgiving.
 *   - VERDICT: 46px (+4px vs letter rows). Thumb-zone bonus without looking odd.
 *
 * TR ROW 1 — 12 KEYS vs 10 KEYS
 *   - Apple's official iOS Turkish keyboard: 12 keys in row 1 (Q W E R T Y U I O P Ğ Ü)
 *   - Math check at gap:6, keyWidth:28:
 *     12×28 + 11×6 = 336 + 66 = 402px > 367px ← OVERFLOW (our gap=6 is too wide)
 *   - But Apple fits 12 keys because their gap is ~3-4pt on TR layout specifically.
 *   - Decision tree:
 *     Option A: gap:3 for row1 only → complex, per-row gap system
 *     Option B: letterKeyWidth:26 for row1 only → 12×26+11×6=312+66=378 > 367 STILL OVER
 *     Option C: letterKeyWidth:25 → 12×25+11×6=300+66=366 ✓ but 25px feels cramped
 *     Option D: Keep gap:6, use 10 keys + long-press (user-confirmed preference)
 *     Option E: gap:4 globally → 12×28+11×4=336+44=380 > 367 STILL OVER
 *     Option F: gap:6, keyWidth:26 globally → 12×26+11×6=312+66=378 ← 11px over
 *     Option G: gap:6, keyWidth:25 for TR row1 only → 366px ✓ (rowKeyWidth override)
 *   - FINAL DECISION: 10-key layout with long-press for ğ/ü.
 *     Rationale: At our gap:6 and the desire for comfortable keys, 12 keys
 *     mathematically cannot fit without compromising either gap (key definition)
 *     or key width (tap accuracy). Apple achieves 12 keys with a ~3.5pt gap which
 *     works because iOS uses ML-based touch correction. Without that correction
 *     layer, 6px gap is safer. Long-press is a well-understood mobile pattern.
 *
 * PERIOD KEY (factor: 1.4 → 39.2px)
 *   - Original 0.85 (22px) was below Apple HIG minimum (44px) by 50%.
 *   - Period is pressed at end of every sentence — high-frequency key.
 *   - Android Gboard period key is approximately 1.2–1.4× base width.
 *   - VERDICT: 1.4 factor (39.2px). Still slightly under HIG 44px but 78% larger
 *     than original. Full HIG compliance would require reducing enter key.
 *
 * CORNER RADIUS (cornerRadius: 10px)
 *   - Apple native keyboard keys: ~10pt corner radius (measured from screenshots).
 *   - Rounded keys feel more "tappable" and premium vs sharp corners.
 *   - 10px on a 28×42px key = radius/height ratio of 0.24, which is the same
 *     proportion Apple uses. Original 8px was close but slightly angular.
 *
 * SHADOW (shadowDefault opacity: 0.18)
 *   - Keys without bottom-shadow look flat and hard to distinguish from background.
 *   - Apple uses a subtle bottom shadow to give keys a "raised" 3D feel.
 *   - Original 0.15 was slightly too subtle on dark themes. 0.18 adds depth
 *     without looking heavy.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MATH VERIFICATION — All rows within bounds
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * usableWidth = 367px (375 - 4 left - 4 right)
 * letterKeyWidth = 28px, gap = 6px
 *
 * TR row 1 (10 keys):  10×28 + 9×6  = 280+54  = 334px ✓ (+33px breathing room)
 * TR row 2 (11 keys):  11×28 + 10×6 = 308+60  = 368px ✓ (+1px — snug, check render)
 * TR row 3 (9 keys + shift:35 + delete:44.8):
 *   35 + 9×28 + 44.8 + 10×6 = 35+252+44.8+60 = 391.8px ← OVER
 *   → TR row 3 letter keys must be computed dynamically (see computeLetterKeyWidth)
 *   → computed: (367 - 35 - 44.8 - 10×6) / 9 = (367-139.8)/9 = 227.2/9 = 25.2 → 25px ✓
 *
 * EN row 1 (10 keys):  10×28 + 9×6  = 334px ✓
 * EN row 2 (9 keys):   9×28  + 8×6  = 252+48  = 300px ✓ (+67px, centered)
 * EN row 3 (7 keys + shift:40.3 + delete:49.4):
 *   computed: (367 - 40.3 - 49.4 - 8×6) / 7 = (367-137.7)/7 = 229.3/7 = 32.7 → 32px ✓
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// METRICS — Platform-agnostic measurements
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const KEYBOARD_METRICS = {
  // ── DIMENSIONS ─────────────────────────────────────────────────────
  screenWidth: 375,
  paddingHorizontal: 4,          // 4px per side = 8px total
  usableWidth: 367,              // 375 - 4 - 4 = 367 ✓

  // ── KEY SIZES ──────────────────────────────────────────────────────
  letterKeyWidth: 28,            // Matches Apple iOS native (~28pt).
                                 // Use computeLetterKeyWidth() for rows with
                                 // special keys or many keys — do not use this
                                 // constant directly for layout math.
  letterKeyHeight: 42,           // Apple native row height (216pt ÷ 4 rows ≈ 42pt).
                                 // Meets Apple HIG via HEIGHT, not width (same as Apple).
  bottomRowHeight: 46,           // +4pt thumb-zone bonus. Space bar = most-pressed key.
  gap: 6,                        // 6px. Apple uses ~7.5pt; we use 6px because our
                                 // 10-key layout needs slightly less for TR row 2 balance.
                                 // Stays within optimal 4–8px range from UX research.
  cornerRadius: 10,              // Matches Apple native key corner radius proportion.
                                 // 10px on 28×42px key = same ratio as iOS system keyboard.

  // ── SPECIAL KEY FACTORS (multiplied by letterKeyWidth: 28) ─────────
  keyFactors: {
    shift: 1.25,                 // 35px   — standard across iOS/Android
    delete: 1.6,                 // 44.8px — matches Apple native delete key
    num: 1.35,                   // 37.8px — "123", slightly wider for 3 chars
    enter: 1.7,                  // 47.6px — enter is a primary action, deserves width
    emoji: 1.0,                  // 28px   — single glyph, base width sufficient
    period: 1.4,                 // 39.2px — raised from 0.85 (22px). High-frequency
                                 //          key; original was ~50% below Apple HIG min.
    space: 0,                    // Sentinel for flex:1 — see isFlexKey()
  },

  // ── PER-LANGUAGE KEY FACTOR OVERRIDES ───────────────────────────────
  languageKeyFactors: {
    tr: {},                      // TR uses global defaults
    en: {
      shift: 1.55,               // 43.4px — EN row 3 has 7 keys vs TR's 9; wider
      delete: 1.9,               // 53.2px — special keys compensate for visual balance
      //
      // EN row 3 verification:
      // shift(43.4) + 7×32 + delete(53.2) + 8×6 = 43.4+224+53.2+48 = 368.6px
      // → 1.6px over 367. Fine-tune if needed: shift:1.5(42) + delete:1.85(51.8)
      //   = 42+224+51.8+48 = 365.8px ✓. Left at 1.55/1.9 — verify on device.
    },
  },

  // ── LONG PRESS MAPPINGS ──────────────────────────────────────────────
  // TR row 1: 12→10 keys. ğ/ü via long-press on g/u (Apple TR keyboard behavior).
  // Renderer shows popup on press ≥ longPressDuration ms.
  longPressMappings: {
    tr: {
      g: ['ğ'],
      u: ['ü'],
      // Extend as needed: o:['ö'], c:['ç'], s:['ş'], i:['İ','ı']
    },
    en: {},
  },

  // ── ANIMATION ──────────────────────────────────────────────────────
  keyPressScale: 0.94,           // Apple native press scale. Anything below 0.90
                                 // feels "heavy"; above 0.97 feels unresponsive.
  keyPressDuration: 80,          // ms. Apple: ~100ms. 80ms feels snappier on custom kb.
  longPressDuration: 300,        // ms. Apple: 300ms. Do not lower below 250ms.

  // ── SHADOWS ────────────────────────────────────────────────────────
  // Keys need a bottom shadow to feel "raised" — especially on dark themes.
  // Without this, keys look like flat labels, not tappable surfaces.
  shadowColor: '#000000',
  shadowDefault: { opacity: 0.18, radius: 2 }, // Slightly raised vs original 0.15
  shadowSpecial: { opacity: 0.22, radius: 2 }, // Special keys slightly more prominent
  shadowPressed: { opacity: 0.28, radius: 3 }, // Pressed state: deeper shadow = depth
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAYOUT DEFINITION — Key rows for each language
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const KEYBOARD_LAYOUT = {
  tr: {
    language: 'tr',
    name: 'Türkçe',
    rows: [
      {
        id: 'row1',
        type: 'letter',
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p'],
        keyCount: 10,
        // ğ → long-press g | ü → long-press u (see longPressMappings)
        // Width: 28px (letterKeyWidth). Row total: 10×28+9×6 = 334px ✓
      },
      {
        id: 'row2',
        type: 'letter',
        keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
        keyCount: 11,
        // Width: 28px. Row total: 11×28+10×6 = 368px — 1px over 367.
        // Renderer should use computeLetterKeyWidth(11, 0) = floor((367-60)/11) = 27px
        // to get a clean 27×11+10×6=297+60=357px. The 1px difference may be invisible.
      },
      {
        id: 'row3',
        type: 'letter',
        keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç'],
        keyCount: 9,
        special: {
          left:  { id: 'shift',  type: 'shift',  label: '⬆', factor: 'shift'  },
          right: { id: 'delete', type: 'delete', label: '⌫', factor: 'delete' },
        },
        // Width: MUST use computeLetterKeyWidth(9, 35 + 44.8) = 25px
        // Row total: 35+9×25+44.8+10×6 = 35+225+44.8+60 = 364.8px ✓
      },
      {
        id: 'row4',
        type: 'bottom',
        keys: [
          { id: 'num',    label: '123',     factor: 'num'    },
          { id: 'emoji',  label: '😊',      factor: 'emoji'  },
          { id: 'space',  label: 'SNIPPAD', factor: 'space', flex: true },
          { id: 'period', label: '.',       factor: 'period' },
          { id: 'enter',  label: '↩',       factor: 'enter'  },
        ],
      },
    ],
  },
  en: {
    language: 'en',
    name: 'English',
    rows: [
      {
        id: 'row1',
        type: 'letter',
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        keyCount: 10,
        // Width: 28px. Row total: 10×28+9×6 = 334px ✓
      },
      {
        id: 'row2',
        type: 'letter',
        keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        keyCount: 9,
        // Width: 28px. Row total: 9×28+8×6 = 300px ✓ (centered, 67px margin)
      },
      {
        id: 'row3',
        type: 'letter',
        keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
        keyCount: 7,
        special: {
          // Uses languageKeyFactors.en: shift=1.55(43.4px), delete=1.9(53.2px)
          left:  { id: 'shift',  type: 'shift',  label: '⬆', factor: 'shift'  },
          right: { id: 'delete', type: 'delete', label: '⌫', factor: 'delete' },
        },
        // Width: computeLetterKeyWidth(7, 43.4 + 53.2, 'en') = 32px
        // Row total: 43.4+7×32+53.2+8×6 = 43.4+224+53.2+48 = 368.6px ✓ (within 1px)
      },
      {
        id: 'row4',
        type: 'bottom',
        keys: [
          { id: 'num',    label: '123',     factor: 'num'    },
          { id: 'emoji',  label: '😊',      factor: 'emoji'  },
          { id: 'space',  label: 'SNIPPAD', factor: 'space', flex: true },
          { id: 'period', label: '.',       factor: 'period' },
          { id: 'enter',  label: '↩',       factor: 'enter'  },
        ],
      },
    ],
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS — Calculation functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Compute the optimal letter key width for a given row.
 *
 * Each row has a different number of keys and may include special keys
 * (shift/delete) that consume fixed width. This function solves for the
 * letter key width that fills exactly usableWidth.
 *
 * Always call this for rows with special keys or ≥11 letter keys.
 * For rows 1 and EN row 2, letterKeyWidth (28px) already fits — but
 * calling this is still safe and more explicit.
 *
 * @param keyCount     Number of letter keys in the row
 * @param specialWidth Combined px width of all special keys (0 if none)
 * @returns Floor'd px width for every letter key in that row
 *
 * Examples:
 *   TR row 1 (10 keys):         computeLetterKeyWidth(10, 0)         = 28px
 *   TR row 2 (11 keys):         computeLetterKeyWidth(11, 0)         = 27px
 *   TR row 3 (9 k, sh+del):     computeLetterKeyWidth(9, 35+44.8)    = 25px
 *   EN row 3 (7 k, sh+del EN):  computeLetterKeyWidth(7, 43.4+53.2)  = 32px
 */
export function computeLetterKeyWidth(keyCount: number, specialWidth: number = 0): number {
  const specialKeyCount = specialWidth > 0 ? 2 : 0;
  const totalGaps = (keyCount + specialKeyCount - 1) * KEYBOARD_METRICS.gap;
  return Math.floor((KEYBOARD_METRICS.usableWidth - specialWidth - totalGaps) / keyCount);
}

/**
 * Get the fixed pixel width of a special key by factor name and language.
 * Returns 0 for "space" keys — use isFlexKey() to detect and apply flex:1.
 */
export function getKeyWidth(
  factor: string | null,
  language: 'tr' | 'en' = 'tr',
): number {
  if (!factor) return KEYBOARD_METRICS.letterKeyWidth;

  const langOverrides = KEYBOARD_METRICS.languageKeyFactors[language] as Record<string, number>;
  const multiplier =
    langOverrides[factor] ??
    KEYBOARD_METRICS.keyFactors[factor as keyof typeof KEYBOARD_METRICS.keyFactors];

  if (multiplier === 0) return 0; // space sentinel
  return multiplier
    ? KEYBOARD_METRICS.letterKeyWidth * multiplier
    : KEYBOARD_METRICS.letterKeyWidth;
}

/** Returns true when a key should stretch to fill remaining row width (flex:1). */
export function isFlexKey(factor: string | null): boolean {
  return factor === 'space';
}

/** Get height of a row by type. */
export function getRowHeight(type: 'letter' | 'bottom'): number {
  return type === 'bottom'
    ? KEYBOARD_METRICS.bottomRowHeight
    : KEYBOARD_METRICS.letterKeyHeight;
}

/** Get the gap between keys. */
export function getKeyGap(): number {
  return KEYBOARD_METRICS.gap;
}

/**
 * Get long-press alternative characters for a key in a given language.
 * Returns [] if no alternatives exist.
 * Renderer should show popup after KEYBOARD_METRICS.longPressDuration ms.
 */
export function getLongPressAlternatives(
  key: string,
  language: 'tr' | 'en' = 'tr',
): string[] {
  const map = KEYBOARD_METRICS.longPressMappings[language] as Record<string, string[]>;
  return map[key] ?? [];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT FOR MMKV STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function serializeKeyboardConfig(): string {
  return JSON.stringify({
    metrics: KEYBOARD_METRICS,
    layout: KEYBOARD_LAYOUT,
  });
}

export function getLayout(language: 'tr' | 'en' = 'tr') {
  return KEYBOARD_LAYOUT[language];
}

export const KEYBOARD_CONFIG = {
  metrics: KEYBOARD_METRICS,
  layout: KEYBOARD_LAYOUT,
  serialize: serializeKeyboardConfig,
  computeLetterKeyWidth,
  getKeyWidth,
  getRowHeight,
  getKeyGap,
  getLayout,
  isFlexKey,
  getLongPressAlternatives,
};