/**
 * src/lib/imagekit.ts
 *
 * Client-safe URL helpers for ImageKit. Builds public, transformation-based
 * URLs from a file's path — no API key needed, since these are just public
 * CDN URLs.
 *
 * Usage:
 *   <img src={getImageUrl(file.filePath, { width: 800 })} />
 *   <img src={getPdfPageThumbnail(file.filePath, 1, { width: 800 })} />
 */

export const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/eakxyfn8o';

type Transform = {
    width?: number;
    height?: number;
    quality?: number; // 1-100
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
};

function buildTransformString(t?: Transform): string {
    if (!t) return '';
    const parts: string[] = [];
    if (t.width) parts.push(`w-${t.width}`);
    if (t.height) parts.push(`h-${t.height}`);
    if (t.quality) parts.push(`q-${t.quality}`);
    if (t.crop) parts.push(`c-${t.crop}`);
    return parts.length ? `tr:${parts.join(',')}` : '';
}

/**
 * Ensure exactly one leading slash, no double slashes, and that every path
 * segment is properly URL-encoded. Filenames frequently contain spaces,
 * accented characters, or parentheses (e.g. "Cerezo Topografía - Cabezudo
 * Gestion Documental 1.jpg"); left raw, these break in <img src>, and
 * especially inside CSS url(...) where unencoded spaces/parens can fail
 * to parse at all.
 */
function normalizePath(filePath: string): string {
    const clean = '/' + filePath.replace(/^\/+/, '');
    return clean
        .split('/')
        .map((segment) => (segment ? encodeURIComponent(segment) : segment))
        .join('/');
}

/**
 * Build a direct, optionally-resized URL for an image file.
 * Works for any file ImageKit can serve directly (jpg, png, webp, etc).
 */
export function getImageUrl(filePath: string, transform?: Transform): string {
    const path = normalizePath(filePath);
    const tr = buildTransformString(transform);
    return tr
        ? `${IMAGEKIT_URL_ENDPOINT}/${tr}${path}`
        : `${IMAGEKIT_URL_ENDPOINT}${path}`;
}

/**
 * Build a thumbnail URL for a specific page of a PDF (or other multi-page
 * asset). Page numbers start at 1. Great for rendering a PDF as a poster
 * image / card preview without loading the whole PDF.
 */
export function getPdfPageThumbnail(
    filePath: string,
    page = 1,
    transform?: Transform
): string {
    const path = normalizePath(filePath);
    const tr = buildTransformString({ quality: 80, ...transform });
    const query = tr ? `?tr=${tr.replace(/^tr:/, '')},pg-${page}` : `?tr=pg-${page}`;
    return `${IMAGEKIT_URL_ENDPOINT}${path}/ik-thumbnail.jpg${query}`;
}

/** Direct, unmodified file URL — good for <iframe> embeds or downloads. */
export function getFileUrl(filePath: string): string {
    return `${IMAGEKIT_URL_ENDPOINT}${normalizePath(filePath)}`;
}