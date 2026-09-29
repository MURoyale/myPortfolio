export type DeviceMode = 'classic' | 'wide';

// Dimensions share a 100 CSS pixels = 1 scene unit coordinate system.
export const deviceLayouts = {
  classic: { width: 455, height: 695, depth: 0.59, label: 'Classic', screen: { left: 52.5, top: 75.5, width: 350, height: 324 }, controls: { left: 52.5, top: 462 } },
  wide: { width: 960, height: 520, depth: 0.64, label: 'Wide', screen: { left: 190, top: 70, width: 580, height: 370 }, controls: { left: 0, top: 0 } },
} as const;
