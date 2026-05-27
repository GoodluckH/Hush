export type HushMessage =
  | { type: 'toggle-hush' }
  | { type: 'set-hush'; enabled: boolean };
