import { join } from 'node:path';
import { cp } from 'node:fs/promises';

const src = join('src', 'assets');
const dest = join('lib', 'assets');

await cp(src, dest, {
    recursive: true,
    force: true
});

console.log('[beatprints.js]: Moved assets folder.');