export const properties = [
  { value: 'home', label: 'My home', description: 'A house, condo or other residence' },
  { value: 'business', label: 'My business', description: 'A shop, office or other commercial property' },
  { value: 'build', label: 'A new build or renovation', description: 'A project where wiring can be planned early' },
  { value: 'unsure', label: 'I’m still figuring it out', description: 'Start with the things you want help with' },
] as const;

export const priorities = [
  { value: 'alarm', label: 'Alarms and detection', description: 'Intrusion, motion, fire or water detection' },
  { value: 'video', label: 'Cameras and video', description: 'See what’s happening around your property' },
  { value: 'access', label: 'Door access', description: 'Manage who can enter and when' },
  { value: 'monitoring', label: 'Professional monitoring', description: 'Have a station available around the clock' },
  { value: 'wiring', label: 'Pre-wiring and networking', description: 'Plan wiring for a build or renovation' },
  { value: 'existing', label: 'An existing system', description: 'Ask about maintenance, upgrades or compatibility' },
  { value: 'guidance', label: 'Help me decide', description: 'Talk through the options first' },
] as const;

export function quotePath(
  property?: typeof properties[number]['value'],
  priority?: typeof priorities[number]['value'],
) {
  const query = new URLSearchParams();
  if (property) query.set('property', property);
  if (priority) query.set('priority', priority);
  return query.size ? 'quote/?' + query : 'quote/';
}
