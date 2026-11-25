export const catalogueGroups = [
  {
    id: 'alarm-equipment',
    title: 'Alarm panels, power and detection',
    items: [
      { name: 'Alexor 2-Way Wireless Security Control Panel', path: 'alexor-2-way-wireless-security-control-panel', purpose: 'Controls a compatible wireless alarm system.' },
      { name: 'PowerSeries Control Panel PC1616', path: 'powerseries-control-panel', purpose: 'Central controller for a compatible PowerSeries alarm system.' },
      { name: 'PowerSeries Control Panel PC1832', path: 'powerseries-control-panel-pc1832', purpose: 'Central controller for a compatible PowerSeries alarm system.' },
      { name: 'PowerSeries Control Panel PC1864', path: 'powerseries-control-panel-pc1864', purpose: 'Central controller for a compatible PowerSeries alarm system.' },
      { name: 'IMPASSA SCW9057', path: 'impassa-self-contained-2-way-wireless-security-system-scw9057', purpose: 'Self-contained wireless alarm system.' },
      { name: '12 V 7 Ah replacement alarm battery', path: '12v-7ah-alarm-home-security-system-repl-battery', purpose: 'Backup power for compatible equipment.' },
      { name: 'Google Nest Protect, 2nd generation', path: 'google-nest-protect-smoke-and-carbon-monoxide-alarm-with-battery-2nd-generation', purpose: 'Smoke and carbon monoxide alarm. Google still supports existing devices and has stopped selling it.' },
    ],
  },
  {
    id: 'video-equipment',
    title: 'Cameras and video doorbells',
    items: [
      { name: 'Google Nest Cam Indoor', path: 'google-nest-cam-indoor-security-camera', purpose: 'Video for indoor spaces.' },
      { name: 'Google Nest Cam Outdoor', path: 'google-nest-cam-outdoor-security-camera', purpose: 'Video for outdoor areas.' },
      { name: 'Google Nest Hello Video Doorbell', path: 'google-nest-hello-video-doorbell', purpose: 'Shows activity at the door on a compatible screen or app.' },
    ],
  },
  {
    id: 'connected-equipment',
    title: 'Networking and connected home',
    items: [
      { name: 'Google Nest Wifi AC2200, two-pack', path: 'google-nest-wifi-ac2200-mesh-wifi-system-wifi-router-4400-sq-ft-coverage-2-pack', purpose: 'Mesh Wi-Fi equipment for a home network.' },
      { name: 'Google Nest Hub with Assistant', path: 'google-nest-hub-with-assistant', purpose: 'A smart display for compatible connected devices.' },
      { name: 'Google Nest Hub Gen 2', path: 'google-nest-hub-gen-2', purpose: 'A second-generation smart display for compatible devices.' },
      { name: 'Google Nest Learning Thermostat, 3rd Gen', path: 'google-nest-learning-thermostat-3rd-gen', purpose: 'A connected thermostat for compatible heating and cooling equipment.' },
    ],
  },
] as const;
