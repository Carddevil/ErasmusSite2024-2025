/**
 * scripts/fetch-imagekit-files.js
 *
 * Run this LOCALLY (never in the browser) whenever you add/remove files
 * in ImageKit. It calls ImageKit's private "List Files" API and writes
 * the full file list to src/data/files.json, which your React app then
 * imports as a normal static asset — no API key ships to the browser,
 * no server needed.
 *
 * Usage:
 *   1. Create a .env file in the project root (see .env.example):
 *        IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxxxx
 *   2. Run:
 *        node scripts/fetch-imagekit-files.js
 *   3. Commit the updated src/data/files.json (or rerun before each deploy).
 */

const fs = require('fs');
const path = require('path');

// Minimal .env loader so this works with zero extra dependencies.
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnvFile();

const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const API_BASE = 'https://api.imagekit.io/v1/files';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'files.json');

if (!PRIVATE_KEY) {
    console.error(
        '\n✖ IMAGEKIT_PRIVATE_KEY is not set.\n' +
        '  Create a .env file in the project root with:\n' +
        '    IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxxxxxxxxxx\n' +
        '  Get it from https://imagekit.io/dashboard/developer/api-keys\n'
    );
    process.exit(1);
}

async function fetchAllFiles() {
    const auth = Buffer.from(`${PRIVATE_KEY}:`).toString('base64');
    const all = [];
    const limit = 1000;
    let skip = 0;

    while (true) {
        const url = `${API_BASE}?type=file&limit=${limit}&skip=${skip}&sort=ASC_NAME`;
        const res = await fetch(url, {
            headers: { Authorization: `Basic ${auth}` },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`ImageKit list-files failed (${res.status}): ${text}`);
        }

        const page = await res.json();
        if (!Array.isArray(page) || page.length === 0) break;

        for (const f of page) {
            const filePath = f.filePath ?? `/${f.name}`;
            const parts = filePath.split('/').filter(Boolean);
            const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
            const extension = (f.name.split('.').pop() ?? '').toLowerCase();

            all.push({
                fileId: f.fileId,
                name: f.name,
                filePath,
                folder,
                url: f.url,
                fileType: f.fileType,
                extension,
                isPdf: extension === 'pdf',
                width: f.width,
                height: f.height,
                size: f.size,
                createdAt: f.createdAt,
            });
        }

        console.log(`Fetched ${all.length} files so far...`);

        if (page.length < limit) break;
        skip += limit;
    }

    return all;
}

async function main() {
    console.log('Fetching file list from ImageKit...');
    const files = await fetchAllFiles();

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ files, generatedAt: new Date().toISOString() }, null, 2));

    console.log(`\n✓ Wrote ${files.length} files to ${path.relative(process.cwd(), OUTPUT_PATH)}`);

    const folders = [...new Set(files.map((f) => f.folder))].sort();
    console.log('\nFolders found:');
    for (const f of folders) {
        const count = files.filter((file) => file.folder === f).length;
        console.log(`  ${f || '(root)'} — ${count} files`);
    }
}

main().catch((err) => {
    console.error('\n✖ Failed:', err.message);
    process.exit(1);
});