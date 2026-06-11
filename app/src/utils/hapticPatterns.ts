import { Vibration } from 'react-native';

/**
 * Diferansyal haptic patterns for keyboard keys
 * Each key type gets distinct feedback to improve UX
 */

export const HAPTIC_PATTERNS = {
  // Letter keys — light, neutral feedback
  letter: () => {
    Vibration.vibrate(8);
  },

  // Space bar — bigger key, bigger feedback
  space: () => {
    Vibration.vibrate(12);
  },

  // Numbers — slightly stronger than letters
  number: () => {
    Vibration.vibrate(10);
  },

  // Special keys (SHIFT, NUM, ABC) — subtle toggle feedback
  toggle: () => {
    Vibration.vibrate(6);
  },

  // Delete — warning/confirmation pattern (two pulses)
  delete: () => {
    Vibration.vibrate([10, 20, 10]); // 10ms pause 20ms pause 10ms
  },

  // Enter — commit action (strong feedback)
  enter: () => {
    Vibration.vibrate(15);
  },

  // Emoji/MIC/special dock buttons — lighter feedback
  dock: () => {
    Vibration.vibrate(7);
  },

  // Template insertion — success feedback
  insert: () => {
    Vibration.vibrate([8, 15, 8]);
  },

  // Error/invalid — buzz
  error: () => {
    Vibration.vibrate([5, 10, 5, 10, 5]);
  },
};

/**
 * Apply haptic feedback based on key type
 */
export function triggerHapticForKey(keyType: 'letter' | 'space' | 'number' | 'toggle' | 'delete' | 'enter' | 'dock' | 'insert' | 'error') {
  const pattern = HAPTIC_PATTERNS[keyType];
  if (pattern) {
    pattern();
  }
}
