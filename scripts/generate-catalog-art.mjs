// Reusable, local vector artwork; no network assets or manually populated cards.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const destination = fileURLToPath(new URL('../src/assets/images/', import.meta.url));
mkdirSync(destination, { recursive: true });
const themes = [
  ['top-ups', '#142f43', '#4d9eae', 'M-35-5h70v45h-70zM-25-5v-14h50v14M15 12h20'],
  [
    'subscriptions',
    '#3c2b60',
    '#aa8ad5',
    'm0-45 12 30 33 5-24 23 6 32-27-15-27 15 6-32-24-23 33-5Z',
  ],
  ['currency', '#274540', '#8db59b', 'm0-48 37 25v44L0 46l-37-25v-44ZM-37-23 0 0l37-23M0 0v46'],
  ['games', '#342d4f', '#8b89bf', 'M-10-10a23 23 0 1 1 0-1l40 40m-12-12 13-13m-24 2 13-13'],
  [
    'accounts',
    '#593349',
    '#ca88a3',
    'M-20-17a20 20 0 1 0 40 0 20 20 0 1 0-40 0M-37 40v-6a37 37 0 0 1 74 0v6',
  ],
  [
    'services',
    '#34452a',
    '#a9bc70',
    'M-30-25h60c15 0 35 70 15 70-10 0-20-20-25-20H-20c-5 0-15 20-25 20-20 0 0-70 15-70ZM-30-2h20m-10-10v20m40-10h1m12 12h1',
  ],
  [
    'gift-cards',
    '#62432c',
    '#dbb47c',
    'M-40-15h80v20h-80ZM-30 5v40h60V5M0-15v60M0-15c-55 0-30-50 0 0 55 0 30-50 0 0',
  ],
  [
    'software',
    '#243c60',
    '#77a3d2',
    'M-35-35h28v28h-28zM7-35h28v28H7zM-35 7h28v28h-28zM7 7h28v28H7z',
  ],
];
for (const [name, background, accent, path] of themes) {
  const rings = Array.from(
    { length: 6 },
    (_, i) =>
      `<circle cx="315" cy="95" r="${50 + i * 24}" stroke="${accent}" stroke-opacity="${0.2 - i * 0.025}" fill="none"/>`,
  ).join('');
  const dots = Array.from(
    { length: 20 },
    (_, i) =>
      `<circle cx="${20 + (i % 5) * 12}" cy="${55 + Math.floor(i / 5) * 12}" r="1" fill="${accent}" opacity=".3"/>`,
  ).join('');
  writeFileSync(
    `${destination}/catalog-${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><defs><linearGradient id="wash" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${accent}"/></linearGradient><linearGradient id="shade" x2="0" y2="1"><stop stop-color="${background}" stop-opacity="0"/><stop offset="1" stop-color="${background}"/></linearGradient></defs><rect width="400" height="240" fill="${background}"/><path d="M230-40 440 80 230 260 140 140Z" fill="url(#wash)" opacity=".45"/>${rings}${dots}<g transform="translate(285 95) rotate(-16)" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="${background}"><path d="${path}"/></g><rect y="110" width="400" height="130" fill="url(#shade)"/></svg>\n`,
  );
}
