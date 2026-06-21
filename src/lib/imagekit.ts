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
 * segment is encoded the same way ImageKit's own API encodes its `url`
 * field: spaces and accented/special characters are percent-encoded, but
 * commas are left as literal `,` characters (ImageKit's CDN treats `,` as
 * a safe path character — encoding it as %2C breaks thumbnail generation
 * for filenames like "Adrian, Marcel, Kevin i Oliwier - ....pdf").
 */
function normalizePath(filePath: string): string {
    const clean = '/' + filePath.replace(/^\/+/, '');
    return clean
        .split('/')
        .map((segment) =>
            segment ? encodeURIComponent(segment).replace(/%2C/g, ',') : segment
        )
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
 *
 * Uses path-based transforms (/tr:.../path) rather than query-string
 * transforms (?tr=...). Filenames containing literal commas (e.g. "Adrian,
 * Marcel, Kevin i Oliwier - ....pdf") sit unambiguously in their own path
 * segment this way, with no risk of the CDN confusing a comma in the
 * filename with the comma that separates transform parameters in a query
 * string.
 */
export function getPdfPageThumbnail(
    filePath: string,
    page = 1,
    transform?: Transform
): string {
    const path = normalizePath(filePath);
    const tr = buildTransformString({ quality: 80, ...transform });
    const trWithPage = tr ? `${tr},pg-${page}` : `tr:pg-${page}`;
    return `${IMAGEKIT_URL_ENDPOINT}/${trWithPage}${path}/ik-thumbnail.jpg`;
}

/** Direct, unmodified file URL — good for <iframe> embeds or downloads. */
export function getFileUrl(filePath: string): string {
    return `${IMAGEKIT_URL_ENDPOINT}${normalizePath(filePath)}`;
}