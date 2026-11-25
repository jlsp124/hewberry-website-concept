export const ajaxGroups = [
  { id: 'detection', label: 'Detection' },
  { id: 'control', label: 'Control' },
  { id: 'video', label: 'Video' },
  { id: 'environment', label: 'Fire & water' },
] as const;

export const ajaxDevices = [
  { id: 'doorprotect', group: 'detection', name: 'DoorProtect', purpose: 'Detects an opening door or window.' },
  { id: 'motionprotect', group: 'detection', name: 'MotionProtect', purpose: 'Detects movement indoors.' },
  { id: 'motioncam', group: 'detection', name: 'MotionCam', purpose: 'Detects motion and takes photos to help verify an alarm.' },
  { id: 'glassprotect', group: 'detection', name: 'GlassProtect', purpose: 'Listens for the sound of breaking glass.' },
  { id: 'homesiren', group: 'detection', name: 'HomeSiren', purpose: 'Sounds an indoor alarm.' },
  { id: 'hub-2', group: 'control', name: 'Hub 2', purpose: 'Connects the devices and sends alarm alerts.' },
  { id: 'keypad-plus', group: 'control', name: 'KeyPad Plus', purpose: 'Arms and disarms the alarm with a code, tag or card.' },
  { id: 'doorbell', group: 'video', name: 'DoorBell', purpose: 'Shows who is at the door and lets you talk with them.' },
  { id: 'turretcam', group: 'video', name: 'TurretCam', purpose: 'Provides a fixed view of an indoor or outdoor area.' },
  { id: 'nvr', group: 'video', name: 'NVR', purpose: 'Records and stores footage from compatible cameras.' },
  { id: 'fireprotect', group: 'environment', name: 'FireProtect 2', purpose: 'Detects smoke and heat. Some versions also detect carbon monoxide.' },
  { id: 'leaksprotect', group: 'environment', name: 'LeaksProtect', purpose: 'Alerts you when it detects water on the floor.' },
  { id: 'waterstop', group: 'environment', name: 'WaterStop', purpose: 'Can shut off the water when a compatible sensor detects a leak.' },
] as const;
