import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
test('standalone resources work beneath a GitHub project path', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const css = await readFile(resolve(root, 'styles.css'), 'utf8');
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
  assert.doesNotMatch(css, /url\(['"]?\//);
  assert.doesNotMatch(css, /@import ['"]tailwindcss/);
  const resources = [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(match => match[1]);
  for (const resource of resources) await access(resolve(root, resource));
  await access(resolve(root, '.nojekyll'));
});
