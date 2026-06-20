import {
    DRIVE_FILES,
    getDriveImageUrl,
    getDriveFileUrl,
    getDrivePdfThumbnail,
} from './lib/drive';

export default function Home() {
    const imageUrl = getDriveImageUrl(DRIVE_FILES.staze2526_zdjecia.circulo_1);

    const pdfFileId = DRIVE_FILES.root.stronaStartowa_pdf;

    const pdfThumbnail = getDrivePdfThumbnail(pdfFileId);
    const pdfFull = getDriveFileUrl(pdfFileId);

    const pptxUrl = getDriveFileUrl(
        DRIVE_FILES.root.hiszpaniaErasmusPrezentacja_pptx
    );

    return (
        <main style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
            <h1>Asset Test Page</h1>

            <p style={{ color: '#666' }}>
                Image + PDF preview (image-like) + full PDF + PPTX
            </p>

            {/* ── IMAGE ───────────────────────────────────────────── */}
            <section style={{ marginTop: '2rem' }}>
                <h2>Image</h2>

                <img
                    src={imageUrl}
                    alt="Drive image"
                    style={{
                        width: '100%',
                        maxWidth: 600,
                        borderRadius: 8,
                        display: 'block',
                    }}
                />
            </section>

            {/* ── PDF AS IMAGE (FIRST PAGE) ───────────────────────── */}
            <section style={{ marginTop: '3rem' }}>
                <h2>PDF (First page as image)</h2>

                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Rendered via Google Drive thumbnail (image-like preview)
                </p>

                <img
                    src={pdfThumbnail}
                    alt="PDF first page preview"
                    style={{
                        width: '100%',
                        borderRadius: 12,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    }}
                />
            </section>

            {/* ── PDF FULL VIEWER ─────────────────────────────────── */}
            <section style={{ marginTop: '3rem' }}>
                <h2>PDF (Full viewer)</h2>

                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                    Embedded via Google Drive preview (original behavior)
                </p>

                <iframe
                    src={pdfFull}
                    width="100%"
                    height="700px"
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 12,
                    }}
                />
            </section>

            {/* ── PPTX ─────────────────────────────────────────────── */}
            <section style={{ marginTop: '3rem' }}>
                <h2>PowerPoint</h2>

                <iframe
                    src={pptxUrl}
                    width="100%"
                    height="700px"
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 12,
                    }}
                />
            </section>
        </main>
    );
}