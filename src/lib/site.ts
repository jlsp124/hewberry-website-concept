const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function route(path = '') {
  return base + '/' + path.replace(/^\/+/, '');
}

export const company = {
  name: 'Hewberry Alarms Ltd.',
  phone: '778-475-4320',
  telephone: 'tel:+17784754320',
  email: 'hewberryoffice@gmail.com',
  address: '3410 28th Ave, Vernon, BC V1T 1W9',
  currentSite: 'https://www.hewberryalarms.ca/',
  currentContact: 'https://www.hewberryalarms.ca/contact/',
  chamber: 'https://business.vernonchamber.ca/list/member/hewberry-alarms-ltd-prestige-monitoring-station-inc-1700',
  map: 'https://www.google.com/maps/search/?api=1&query=3410+28th+Ave+Vernon+BC',
  prestige: 'https://prestigemonitoring.com/',
};

export const navigation = [
  { name: 'Services', path: '#services' },
  { name: 'Monitoring', path: 'monitoring/' },
  { name: 'About', path: 'about/' },
  { name: 'Customer support', path: 'support/' },
];
