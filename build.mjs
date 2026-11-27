import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite } from './src/site.mjs';

const project = dirname(fileURLToPath(import.meta.url));
const output = resolve(project, 'dist');
if (dirname(output) !== project) throw new Error('Build directory must be inside the project');

const catalogue = JSON.parse(await readFile(join(project, 'src', 'catalogue.json'), 'utf8'));
const publishedUrl = new URL('https://jlsp124.github.io/hewberry-website-concept/');
const pages = [
  ['index.html', 'home'],
  ['equipment/index.html', 'equipment'],
  ['projects/index.html', 'equipment'],
  ['contact/index.html', 'contact'],
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(project, 'assets'), join(output, 'assets'), { recursive: true });
for (const [file, page] of pages) {
  const destination = join(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, renderSite(page, catalogue, false, { staticSite: true, publishedUrl }));
}
for (const [alias, route] of [['systems', 'equipment'], ['quote', 'contact'], ['support', 'contact']]) {
  const directory = join(output, alias);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), `<!doctype html>
<html lang="en-CA"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=../${route}/">
<title>Hewberry Alarms</title></head><body><a href="../${route}/">Continue to Hewberry Alarms</a></body></html>`);
}
await writeFile(join(output, '.nojekyll'), '');
console.log(`Built ${pages.length} static pages with ${catalogue.length} equipment items.`);
