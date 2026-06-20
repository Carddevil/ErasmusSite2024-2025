/**
 * app/page.tsx
 */

import {
    DRIVE_FILES,
    getDriveImageUrl,
    getDriveFileUrl,
} from './lib/drive';

export default function Home() {
    const imageUrl = getDriveImageUrl(DRIVE_FILES.staze2526_zdjecia.circulo_1);
    const pdfUrl   = getDriveFileUrl(DRIVE_FILES.root.stronaStartowa_pdf);
    const pptxUrl  = getDriveFileUrl(DRIVE_FILES.root.hiszpaniaErasmusPrezentacja_pptx);

    return (
        <main style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
            <h1>Asset Test Page</h1>
            <p style={{ color: '#666' }}>
                One image, one PDF, and one PPTX — all served from Google Drive.
            </p>

            {/* ── IMAGE ─────────────────────────────────────────────────────────── */}
            <section style={{ marginTop: '2rem' }}>
                <h2>Image</h2>
                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Loaded via <code>getDriveImageUrl(fileId)</code> — renders as a real &lt;img&gt;
                </p>
                {/*
          getDriveImageUrl uses drive.google.com/thumbnail which serves
          the image directly — no iframe needed.
          Add this domain to next.config.js if using Next.js <Image> component.
        */}
                <img
                    src={imageUrl}
                    alt="Sample from Google Drive"
                    style={{ width: '100%', maxWidth: 600, borderRadius: 8, display: 'block' }}
                />
            </section>

            {/* ── PDF ───────────────────────────────────────────────────────────── */}
            <section style={{ marginTop: '3rem' }}>
                <h2>PDF</h2>
                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Embedded via <code>getDriveFileUrl(fileId)</code>
                </p>
                <iframe
                    src={pdfUrl}
                    title="Sample PDF"
                    width="100%"
                    height="600px"
                    style={{ border: '1px solid #ddd', borderRadius: 8 }}
                    allowFullScreen
                />
            </section>

            {/* ── PPTX ──────────────────────────────────────────────────────────── */}
            <section style={{ marginTop: '3rem' }}>
                <h2>PowerPoint</h2>
                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Embedded via <code>getDriveFileUrl(fileId)</code>
                </p>
                <iframe
                    src={pptxUrl}
                    title="Sample PPTX"
                    width="100%"
                    height="600px"
                    style={{ border: '1px solid #ddd', borderRadius: 8 }}
                    allowFullScreen
                />
            </section>
        </main>
    );
}