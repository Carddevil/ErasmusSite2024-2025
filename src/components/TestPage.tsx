import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFiles, folder, onlyImages, onlyPdfs, findByName, type ImageKitFile } from '../lib/useFiles';
import { getImageUrl, getFileUrl, getPdfPageThumbnail } from '../lib/imagekit';

// ─── PAGE VIEW STATE ──────────────────────────────────────────────────────────
type PageView = { type: 'home' } | { type: 'edition'; edition: string };

// ─── NAV LINKS (anchor links within the home page) ────────────────────────────
const NAV_LINKS = [
    { label: 'Staże',       href: '#staze'       },
    { label: 'Galeria',     href: '#galeria'      },
    { label: 'O projekcie', href: '#o-projekcie'  },
    { label: 'Prezentacje', href: '#prezentacje'  },
    { label: 'Kontakt',     href: '#kontakt'      },
];

// ─── FOLDER METADATA (display label + icon per folder key) ──────────────────
const FOLDERS_META: Record<string, { label: string; icon: string }> = {
    staze2526_zdjecia: { label: 'Staże 2025/26 — zdjęcia z pracy', icon: '💼' },
    galeria2526:       { label: 'Czas wolny 2025/26',              icon: '🌞' },
    staze2526_pdf:     { label: 'Prezentacje 2025/26',             icon: '📄' },
    slowniczki2526:    { label: 'Słowniczki zawodowe 2025/26',     icon: '📚' },
    staze2425_zdjecia: { label: 'Staże 2024/25 — zdjęcia z pracy', icon: '💼' },
    galeria2425:       { label: 'Czas wolny 2024/25',              icon: '🌞' },
    staze2425_pdf:     { label: 'Prezentacje 2024/25',             icon: '📄' },
    slowniczki2425:    { label: 'Słowniczki zawodowe 2024/25',     icon: '📚' },
};

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose }: { photos: ImageKitFile[]; startIndex: number; onClose: () => void }) {
    const [idx, setIdx] = useState(startIndex);
    const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
    const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose, prev, next]);
    const photo = photos[idx];
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <img src={getImageUrl(photo.filePath, { width: 1200 })} alt={photo.name} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '88vh', maxWidth: '88vw', borderRadius: 10, objectFit: 'contain' }} />
            <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{idx + 1} / {photos.length}</div>
        </div>
    );
}

// ─── PHOTO GRID ───────────────────────────────────────────────────────────────
function PhotoGrid({ photos, onPhotoClick }: { photos: ImageKitFile[]; onPhotoClick: (i: number) => void }) {
    return (
        <div style={{ columns: '3 200px', columnGap: 10 }}>
            {photos.map((p, i) => (
                <div key={p.fileId} onClick={() => onPhotoClick(i)} style={{ breakInside: 'avoid', marginBottom: 10, borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
                    <img src={getImageUrl(p.filePath, { width: 600 })} alt={p.name} loading="lazy" style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                         onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                         onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
                </div>
            ))}
        </div>
    );
}

// ─── PDF CARD (thumbnail preview of first page) ──────────────────────────────
function ThumbnailPdfCard({ file }: { file: ImageKitFile }) {
    const label = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
    const href = getFileUrl(file.filePath);
    const thumb = getPdfPageThumbnail(file.filePath, 1, { width: 600 });
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
           style={{ display: 'block', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,72,182,0.12)', background: '#e8eef9', textDecoration: 'none', transition: 'transform 0.18s, box-shadow 0.18s' }}
           onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,72,182,0.16)'; }}
           onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <img
                src={thumb}
                alt={label}
                loading="lazy"
                style={{ width: '100%', height: 195, objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
                            <rect width="600" height="400" fill="#e8eef9"/>
                            <text x="300" y="210" font-family="Arial, sans-serif"
                                  font-size="64" font-weight="700" fill="#0048b6"
                                  text-anchor="middle">PDF</text>
                        </svg>`
                    );
                }}
            />
            <div style={{ padding: '8px 12px 10px', background: '#fff', fontSize: 12, fontWeight: 600, color: '#001f5c', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.35 }}>
                {label}
            </div>
        </a>
    );
}

// ─── EDITION VIEW (full sub-page for 2024/25 or 2025/26) ─────────────────────

const FOLDER_PATHS: Record<string, string> = {
    staze2526_zdjecia: 'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2025-2026 Nasze staże u pracodawców - w obiektywie',
    galeria2526:       'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2025-2026 Galeria po godzinach',
    staze2526_pdf:     'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2025-2026 Naze staże u pracodawców - prezentacje',
    staze2425_zdjecia: 'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2024-2025 Nasze staże u pracodawców w obiektywie',
    galeria2425:       'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2024-2025 Galeria po godzinach',
    staze2425_pdf:     'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2024-2025 Nasze staże u pracodawców - prezentacje',
    slowniczki2526:    'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2025-2026 Nasze słowniczki zawodowe',
    slowniczki2425:    'Assets/STRONA INTERNETOWA PROJEKTY 2024 i 2025/Hiszpania 2024-2025 Nasze słowniczki zawodowe',
};

const EDITION_FOLDERS: Record<string, string[]> = {
    '2526': ['staze2526_zdjecia', 'galeria2526', 'staze2526_pdf', 'slowniczki2526'],
    '2425': ['staze2425_zdjecia', 'galeria2425', 'staze2425_pdf', 'slowniczki2425'],
};

const EDITION_LINKS: Record<string, { label: string; href: string }[]> = {
    '2526': [
        { label: 'Więcej na stronie szkoły', href: 'https://tech3.malbork.pl/2025-1-pl01-ka121-vet-000329247/' },
    ],
    '2425': [
        { label: 'Więcej na stronie szkoły', href: 'https://tech3.malbork.pl/2024-1-pl01-ka121-vet-000207269/?preview=true' },
    ],
};

function EditionView({ edition, onBack }: { edition: string; onBack: () => void }) {
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const { byFolder } = useFiles();
    const edFolders = EDITION_FOLDERS[edition];

    const getJsonFiles = useCallback(
        (folderKey: string): ImageKitFile[] => byFolder[FOLDER_PATHS[folderKey]] ?? [],
        [byFolder]
    );

    const heroFiles = useMemo(() => {
        return getJsonFiles(edFolders[0])
            .filter((f) => !f.isPdf)
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            .slice(0, 6);
    }, [getJsonFiles, edFolders]);

    const [heroIdx, setHeroIdx] = useState(0);

    useEffect(() => {
        if (heroFiles.length === 0) return;
        const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroFiles.length), 4000);
        return () => clearInterval(t);
    }, [heroFiles.length]);

    useEffect(() => { setActiveFolder(null); setHeroIdx(0); }, [edition]);

    const links = EDITION_LINKS[edition].filter((l) => l.href !== '');

    if (activeFolder) {
        const folderFiles = getJsonFiles(activeFolder);
        const isPdf = activeFolder.endsWith('_pdf') || activeFolder.startsWith('slowniczki');
        const meta = FOLDERS_META[activeFolder];
        const photoFiles = folderFiles.filter((f) => !f.isPdf);
        return (
            <div style={{ padding: '0 0 40px' }}>
                {lightbox !== null && <Lightbox photos={photoFiles} startIndex={lightbox} onClose={() => setLightbox(null)} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button onClick={() => setActiveFolder(null)} style={{ background: 'none', border: '1px solid rgba(0,72,182,0.25)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#0048b6', fontWeight: 600, fontSize: 13 }}>← Wróć</button>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#001f5c' }}>{meta.icon} {meta.label}</h2>
                    <span style={{ fontSize: 13, color: '#888', marginLeft: 'auto' }}>{folderFiles.length} plików</span>
                </div>
                {isPdf ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {folderFiles.map((f) => <ThumbnailPdfCard key={f.fileId} file={f} />)}
                    </div>
                ) : (
                    <PhotoGrid photos={folderFiles} onPhotoClick={(li) => setLightbox(li)} />
                )}
            </div>
        );
    }

    return (
        <div>
            <div style={{ position: 'relative', height: 320, borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
                {heroFiles.map((p, i) => (
                    <div key={p.fileId} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${getImageUrl(p.filePath, { width: 1200 })})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === heroIdx ? 1 : 0, transition: 'opacity 1s ease' }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)' }} />
                <div style={{ position: 'absolute', bottom: 24, left: 24 }}>
                    <h1 style={{ margin: 0, color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>Erasmus+ España</h1>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>Edycja {edition === '2425' ? '2024/2025' : '2025/2026'}</p>
                </div>
                <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 6 }}>
                    {heroFiles.map((_, i) => <div key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'width 0.3s, background 0.3s' }} />)}
                </div>
            </div>

            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#001f5c' }}>Zdjęcia i materiały</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {edFolders.map((fk) => {
                    const meta = FOLDERS_META[fk];
                    const files = getJsonFiles(fk);
                    const count = files.length;
                    const preview = files.find((f) => !f.isPdf);
                    return (
                        <div key={fk} onClick={() => setActiveFolder(fk)}
                             style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,72,182,0.12)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', background: '#fff' }}
                             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,72,182,0.16)'; }}
                             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            {preview
                                ? <div style={{ height: 130, overflow: 'hidden' }}><img src={getImageUrl(preview.filePath, { width: 400 })} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                                : <div style={{ height: 130, background: '#e8eef9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{meta.icon}</div>}
                            <div style={{ padding: '12px 14px' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#001f5c', marginBottom: 4 }}>{meta.icon} {meta.label}</div>
                                <div style={{ fontSize: 12, color: '#0048b6', fontWeight: 600 }}>{count} {fk.endsWith('_pdf') ? 'prezentacji' : fk.startsWith('slowniczki') ? 'słowniczków' : 'zdjęć'}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {links.length > 0 && (
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(0,72,182,0.12)' }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#001f5c' }}>Dodatkowe materiały</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {links.map((l) => (
                            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                               style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: '#0048b6', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', transition: 'background 0.18s, transform 0.15s' }}
                               onMouseEnter={(e) => { e.currentTarget.style.background = '#0036a0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                               onMouseLeave={(e) => { e.currentTarget.style.background = '#0048b6'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                🔗 {l.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {links.length === 0 && (
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(0,72,182,0.12)' }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#001f5c' }}>Dodatkowe materiały</h2>
                    <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>
                        Dodaj linki w <code>EDITION_LINKS['{edition}']</code> w pliku <code>TestPage.tsx</code>.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: '#e8eef9', color: '#0048b6', fontWeight: 700, fontSize: 14, border: '2px dashed rgba(0,72,182,0.3)' }}>
                        🔗 Przykładowy link (zastąp w kodzie)
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── FOLDER NAMES ─────────────────────────────────────────────────────────────
const FOLDERS = {
    staze2526_zdjecia:      'Hiszpania 2025-2026 Nasze staże u pracodawców - w obiektywie',
    staze2526_prezentacje:  'Hiszpania 2025-2026 Naze staże u pracodawców - prezentacje',
    galeria2526:             'Hiszpania 2025-2026 Galeria po godzinach',
    staze2425_zdjecia:      'Hiszpania 2024-2025 Nasze staże u pracodawców w obiektywie',
    staze2425_prezentacje:  'Hiszpania 2024-2025 Nasze staże u pracodawców - prezentacje',
    galeria2425:             'Hiszpania 2024-2025 Galeria po godzinach',
    slowniczki2526:           'Hiszpania 2025-2026 Nasze słowniczki zawodowe',
    slowniczki2425:           'Hiszpania 2024-2025 Nasze słowniczki zawodowe',
    podsumowania:            'Podsumowania',
    erasmusDay:              'ERASMUS DAY',
};

// ─── CARD DEFS (Exclusively 2025/2026) ────────────────────────────────────────
const CARD_DEFS_2526 = [
    { name: 'Hotel Spirit',           location: 'Benalmádena',  match: 'Hotel Spirit' },
    { name: 'Chiringuito Copacabana', location: 'Málaga',       match: 'Chiringuito Copacabana' },
    { name: 'Colors Peluquería',      location: 'Torremolinos', match: 'Colors productos' },
    { name: 'Samsung Telemalaga',     location: 'Málaga',       match: 'Samsung' },
    { name: 'Círculo de Empresarios', location: 'Málaga',       match: 'Circulo de Empresarios' },
    { name: 'La Tómbola',             location: 'Benalmádena',  match: 'La Tómbola' },
];

// ─── EDITION CONFIG (Explicitly targeting 2025/2026 context) ──────────────────
const EDITION_CONFIG = {
    '2526': {
        heroSub:     'Program Erasmus+ · Málaga 2025–2026',
        heroBtn:     'Poznaj miejsca',
        eyebrow:     'Erasmus+',
        bodyText:    'W roku szkolnym 2025/2026 nasi uczniowie odbyli staże zawodowe w renomowanych firmach na Costa del Sol. Poznaj miejsca, które stały się ich tymczasowym domem.',
        cardDefs:    CARD_DEFS_2526,
    }
};

function HomePage({ onNavigate }: { onNavigate: (view: PageView) => void }) {
    const { files, byFolder, loading, error } = useFiles();

    const [current, setCurrent]       = useState(0);
    const [menuOpen, setMenuOpen]     = useState(false);
    const [scrolled, setScrolled]     = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const cfg = EDITION_CONFIG['2526'];

    // Find the specific summary cover file requested for the footer
    const stronaStartowaFile = useMemo(() => {
        return findByName(files, "Strona startowa.pdf");
    }, [files]);

    // Real folder maps
    const staze2526Photos = useMemo(() => onlyImages(folder(byFolder, FOLDERS.staze2526_zdjecia)), [byFolder]);
    const staze2425Photos = useMemo(() => onlyImages(folder(byFolder, FOLDERS.staze2425_zdjecia)), [byFolder]);
    const staze2526Pdfs   = useMemo(() => onlyPdfs(folder(byFolder, FOLDERS.staze2526_prezentacje)), [byFolder]);
    const staze2425Pdfs   = useMemo(() => onlyPdfs(folder(byFolder, FOLDERS.staze2425_prezentacje)), [byFolder]);
    const galeria2526Photos = useMemo(() => onlyImages(folder(byFolder, FOLDERS.galeria2526)), [byFolder]);
    const galeria2425Photos = useMemo(() => onlyImages(folder(byFolder, FOLDERS.galeria2425)), [byFolder]);

    const HERO_IMAGES = useMemo(() => {
        const selected: ImageKitFile[] = [];

        if (galeria2526Photos.length > 0) {
            if (galeria2526Photos[0]) selected.push(galeria2526Photos[0]);
            if (galeria2526Photos[1]) selected.push(galeria2526Photos[1]);
            if (galeria2526Photos.length >= 5) selected.push(galeria2526Photos[galeria2526Photos.length - 5]);
            if (galeria2526Photos.length >= 4) selected.push(galeria2526Photos[galeria2526Photos.length - 4]);
            if (galeria2526Photos.length >= 2) selected.push(galeria2526Photos[galeria2526Photos.length - 2]);
        }

        if (galeria2425Photos.length > 0) {
            selected.push(galeria2425Photos[galeria2425Photos.length - 1]);
            if (galeria2425Photos[6]) selected.push(galeria2425Photos[6]);
            if (galeria2425Photos[9]) selected.push(galeria2425Photos[9]);
        }

        for (let i = selected.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selected[i], selected[j]] = [selected[j], selected[i]];
        }
        return selected;
    }, [galeria2526Photos, galeria2425Photos]);

    const INTERNSHIP_CARDS = useMemo(
        () =>
            cfg.cardDefs.map((c) => ({
                ...c,
                file: findByName(staze2526Photos, c.match) ?? staze2526Photos[0],
            })).filter((c) => c.file),
        [staze2526Photos, cfg.cardDefs]
    );

    const GALLERY_IMAGES = useMemo(() => {
        const selected: ImageKitFile[] = [];
        if (galeria2526Photos.length > 0) selected.push(...galeria2526Photos.slice(0, 8));
        if (galeria2425Photos.length > 0) selected.push(...galeria2425Photos.slice(0, 8));

        for (let i = selected.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selected[i], selected[j]] = [selected[j], selected[i]];
        }
        return selected;
    }, [galeria2526Photos, galeria2425Photos]);

    useEffect(() => {
        if (HERO_IMAGES.length === 0) return;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCurrent(c => (c + 1) % HERO_IMAGES.length), 4500);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [HERO_IMAGES.length]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const goTo = (i: number) => {
        setCurrent(i);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCurrent(c => (c + 1) % HERO_IMAGES.length), 4500);
    };

    if (error) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2>Nie udało się wczytać plików z ImageKit</h2>
                <p style={{ color: '#888' }}>{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#0048b6', fontSize: '1.1rem' }}>
                Ładowanie galerii…
            </div>
        );
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght=600;700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #f5f7fa; color: #1a1a2e; overflow-x: hidden; }
        :root {
          --blue:       #0048b6; --blue-dark:  #00338a; --blue-deep:  #001f5c; --blue-light: #e8eef9;
          --white:      #ffffff; --off-white:  #f5f7fa; --text-main:  #1a1a2e; --text-muted: #4a5568;
          --radius:     12px; --nav-h:      68px; --stripe-shadow: 0 8px 32px rgba(0,72,182,0.13), 0 2px 6px rgba(0,0,0,0.06);
        }
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: var(--nav-h); background: rgba(0,72,182,0.93); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.09); transition: height .3s, background .3s;
        }
        .navbar.scrolled { height: 52px; background: rgba(0,51,138,0.98); }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.35rem; color: #fff; text-decoration: none; letter-spacing: .05em; text-transform: uppercase; flex-shrink: 0; }
        .nav-logo span { color: #7eb3ff; }
        .edition-switcher { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.18); border-radius: 8px; padding: 4px; flex-shrink: 0; }
        .edition-btn { font-family: 'Barlow Condensed', sans-serif; font-size: .82rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.6); background: none; border: none; cursor: pointer; padding: .35rem .75rem; border-radius: 6px; transition: background .2s, color .2s; white-space: nowrap; }
        .edition-btn:hover { color: rgba(255,255,255,.9); background: rgba(255,255,255,.08); }
        .edition-btn.active { background: rgba(255,255,255,.18); color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
        .nav-links { display: flex; gap: 1.75rem; list-style: none; }
        .nav-links a { color: rgba(255,255,255,.82); text-decoration: none; font-size: .88rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; padding-bottom: 2px; border-bottom: 2px solid transparent; transition: color .2s, border-color .2s; }
        .nav-links a:hover { color: #fff; border-bottom-color: rgba(255,255,255,.45); }
        .burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
        .burger span { display: block; width: 26px; height: 2px; background: white; border-radius: 2px; transition: all .25s; }
        .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .burger.open span:nth-child(2) { opacity: 0; }
        .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mob-menu { display: none; position: fixed; top: var(--nav-h); left: 0; right: 0; z-index: 99; background: rgba(0,25,76,.97); backdrop-filter: blur(16px); padding: 1.5rem 2rem 2rem; flex-direction: column; gap: 1.1rem; border-bottom: 1px solid rgba(255,255,255,.08); }
        .mob-menu.open { display: flex; }
        .mob-menu a { color: rgba(255,255,255,.9); text-decoration: none; font-family: 'Barlow Condensed', sans-serif; font-size: 1.65rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; transition: color .2s; }
        .mob-menu a:hover { color: #fff; }
        .mob-edition-switcher { display: flex; gap: 8px; margin-bottom: .5rem; }
        .mob-edition-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.55); background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: 8px; cursor: pointer; padding: .45rem 1.1rem; transition: background .2s, color .2s; }
        .mob-edition-btn.active { background: rgba(255,255,255,.18); color: #fff; border-color: rgba(255,255,255,.3); }
        @media (max-width: 768px) { .nav-links { display: none; } .burger { display: flex; } .edition-switcher { display: none; } }
        .hero { position: relative; height: 100svh; min-height: 560px; overflow: hidden; }
        .slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.2s ease; }
        .slide.active { opacity: 1; animation: zoom 7s ease forwards; }
        @keyframes zoom { from { transform: scale(1.04); } to { transform: scale(1); } }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(155deg, rgba(0,25,76,.5) 0%, rgba(0,72,182,.15) 50%, rgba(0,0,0,.6) 100%); }
        .hero-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(520px, 88vw); background: rgba(255,255,255,.12); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.22); border-radius: 4px; padding: 2.75rem 2.75rem 3.5rem; text-align: center; clip-path: polygon(0 0, 100% 0, 100% 87%, 0 100%); }
        .logo-spot { width: 200px; height: 200px; border-radius: 25%; background: rgba(255,255,255,.18); border: 2px dashed rgba(255,255,255,.35); margin: 0 auto 1.4rem; display: flex; align-items: center; justify-content: center; font-size: .6rem; color: rgba(255,255,255,.55); letter-spacing: .06em; text-transform: uppercase; overflow: hidden; }
        .hero-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; line-height: 1.05; color: #fff; text-transform: uppercase; letter-spacing: .025em; text-shadow: 0 2px 20px rgba(0,0,0,.4); }
        .hero-title em { font-style: normal; color: #7eb3ff; }
        .hero-sub { margin-top: .6rem; font-size: .95rem; color: rgba(255,255,255,.75); letter-spacing: .04em; }
        .hero-btn { display: inline-block; margin-top: 1.75rem; padding: .7rem 2rem; background: var(--blue); color: #fff; font-weight: 600; font-size: .875rem; letter-spacing: .07em; text-transform: uppercase; text-decoration: none; border-radius: 3px; border: 1px solid rgba(255,255,255,.18); transition: background .2s, transform .15s; }
        .hero-btn:hover { background: var(--blue-dark); transform: translateY(-2px); }
        .dots { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.35); border: none; cursor: pointer; padding: 0; transition: background .3s, transform .3s; }
        .dot.active { background: #fff; transform: scale(1.45); }
        .sec { position: relative; padding: 5rem 2rem; }
        .inner { max-width: 1100px; margin: 0 auto; }
        .eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: .78rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--blue); margin-bottom: .4rem; }
        .sec-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.08; text-transform: uppercase; letter-spacing: .02em; color: var(--text-main); }
        .sec-body { margin-top: .85rem; font-size: 1rem; line-height: 1.75; color: var(--text-muted); max-width: 620px; }
        .s-white { background: #fff; box-shadow: var(--stripe-shadow); z-index: 3; isolation: isolate; }
        .s-light { background: #eef3fb; box-shadow: var(--stripe-shadow); z-index: 2; isolation: isolate; }
        .s-blue { background: var(--blue); box-shadow: 0 10px 40px rgba(0,72,182,.45), 0 2px 8px rgba(0,0,0,.15); z-index: 1; isolation: isolate; }
        .s-white::after, .s-light::after, .s-blue::after { content: ''; position: absolute; bottom: -5px; left: 0; right: 0; height: 5px; z-index: -1; }
        .s-white::after { background: #d0d8e8; }
        .s-light::after { background: #c5d3e8; }
        .s-blue::after  { background: #00338a; }
        .s-blue .eyebrow   { color: rgba(255,255,255,.55); }
        .s-blue .sec-title { color: #fff; }
        .s-blue .sec-body  { color: rgba(255,255,255,.72); }
        .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
        .card { border-radius: var(--radius); overflow: hidden; background: #fff; box-shadow: 0 2px 10px rgba(0,72,182,.09); transition: transform .25s, box-shadow .25s; }
        .card:hover { transform: translateY(-6px); box-shadow: 0 14px 32px rgba(0,72,182,.18); }
        .card img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .card-body { padding: 1rem 1.2rem; }
        .card-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; }
        .card-loc { font-size: .8rem; color: var(--blue); font-weight: 600; margin-top: .25rem; letter-spacing: .05em; text-transform: uppercase; }
        .gallery { columns: 3; column-gap: 1rem; margin-top: 2.5rem; }
        .gal-item { break-inside: avoid; margin-bottom: 1rem; border-radius: 8px; overflow: hidden; display: block; }
        .gal-item img { width: 100%; display: block; transition: transform .35s; }
        .gal-item:hover img { transform: scale(1.05); }
        @media (max-width: 700px) { .gallery { columns: 2; } }
        @media (max-width: 420px) { .gallery { columns: 1; } }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2.5rem; align-items: start; }
        @media (max-width: 680px) { .two-col { grid-template-columns: 1fr; gap: 2rem; } }
        .pdf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; }
        .pdf-card { border-radius: var(--radius); overflow: hidden; border: 1px solid rgba(0,72,182,.12); background: var(--blue-light); display: block; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease; }
        .pdf-card:hover { transform: translateY(-3px); box-shadow: var(--stripe-shadow); }
        .pdf-card img { width: 100%; height: 195px; object-fit: cover; display: block; }
        .pdf-label { padding: .7rem 1rem; font-size: .78rem; font-weight: 600; color: var(--blue-dark); text-transform: uppercase; letter-spacing: .05em; background: #fff; }
        footer { background: var(--blue-deep); color: rgba(255,255,255,.78); padding: 4rem 2rem 2.5rem; }
        .foot-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem; }
        .foot-brand { font-family: 'Barlow Condensed', sans-serif; font-size: 1.35rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: .05em; margin-bottom: .7rem; }
        .foot-brand span { color: #7eb3ff; }
        .foot-desc { font-size: .87rem; line-height: 1.7; color: rgba(255,255,255,.5); max-width: 280px; }
        .foot-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: .72rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: .9rem; }
        .foot-col ul { list-style: none; display: flex; flex-direction: column; gap: .55rem; }
        .foot-col ul li a { color: rgba(255,255,255,.68); text-decoration: none; font-size: .9rem; transition: color .2s; }
        .foot-col ul li a:hover { color: #fff; }
        .foot-col address { font-style: normal; font-size: .9rem; color: rgba(255,255,255,.65); line-height: 1.85; }
        .foot-col address a { color: rgba(255,255,255,.65); text-decoration: none; transition: color .2s; }
        .foot-col address a:hover { color: #fff; }
        .foot-bottom { max-width: 1100px; margin: 2.5rem auto 0; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,.07); font-size: .78rem; color: rgba(255,255,255,.27); display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; }
        @media (max-width: 680px) { .foot-inner { grid-template-columns: 1fr !important; gap: 2rem; } .foot-desc { max-width: none; } }
        @media (prefers-reduced-motion: reduce) { .slide, .card, .gal-item img, .hero-btn { transition: none; animation: none; } }
      `}</style>

            {/* NAVBAR */}
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
                <a href="#" className="nav-logo">Erasmus&nbsp;<span>España</span></a>

                <div className="edition-switcher">
                    <button className="edition-btn active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
                    <button className="edition-btn" onClick={() => onNavigate({ type: 'edition', edition: '2425' })}>2024/2025</button>
                    <button className="edition-btn" onClick={() => onNavigate({ type: 'edition', edition: '2526' })}>2025/2026</button>
                </div>

                <ul className="nav-links">
                    {NAV_LINKS.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
                </ul>
                <button className={`burger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                    <span /><span /><span />
                </button>
            </nav>

            {/* MOBILE MENU */}
            <div className={`mob-menu${menuOpen ? ' open' : ''}`}>
                <div className="mob-edition-switcher">
                    <button className="mob-edition-btn active" onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</button>
                    <button className="mob-edition-btn" onClick={() => { setMenuOpen(false); onNavigate({ type: 'edition', edition: '2425' }); }}>2024/2025</button>
                    <button className="mob-edition-btn" onClick={() => { setMenuOpen(false); onNavigate({ type: 'edition', edition: '2526' }); }}>2025/2026</button>
                </div>
                {NAV_LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>)}
            </div>

            {/* HERO */}
            <section className="hero">
                {HERO_IMAGES.map((file, i) => (
                    <div
                        key={file.fileId}
                        className={`slide${i === current ? ' active' : ''}`}
                        style={{ backgroundImage: `url(${getImageUrl(file.filePath, { width: 1200 })})` }}
                    />
                ))}
                <div className="hero-overlay" />

                <div className="hero-panel">
                    <div className="logo-spot">
                        <img src="/logo.png" alt="Logo" className="hero-logo-img" />
                    </div>
                    <h1 className="hero-title">Nasze<br /><em>Staże</em><br />w Hiszpanii</h1>
                    <p className="hero-sub">{cfg.heroSub}</p>
                    <a href="#staze" className="hero-btn">{cfg.heroBtn}</a>
                </div>

                <div className="dots">
                    {HERO_IMAGES.map((_, i) => (
                        <button key={i} className={`dot${i === current ? ' active' : ''}`}
                                onClick={() => goTo(i)} aria-label={`Slajd ${i + 1}`} />
                    ))}
                </div>
            </section>

            {/* SECTION 1 */}
            <section id="staze" className="sec s-white">
                <div className="inner">
                    <p className="eyebrow">{cfg.eyebrow}</p>
                    <h2 className="sec-title">Nasze miejsca stażu</h2>
                    <p className="sec-body">{cfg.bodyText}</p>
                    <div className="cards">
                        {INTERNSHIP_CARDS.map(c => (
                            <div className="card" key={c.name}>
                                <img src={getImageUrl(c.file!.filePath, { width: 600 })} alt={c.name} loading="lazy" />
                                <div className="card-body">
                                    <div className="card-name">{c.name}</div>
                                    <div className="card-loc">📍 {c.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '1.5rem', color: '#4a5568' }}>... oraz wiele innych!</p>
                </div>
            </section>

            {/* SECTION 2 */}
            <section id="galeria" className="sec s-light">
                <div className="inner">
                    <p className="eyebrow">Galeria</p>
                    <h2 className="sec-title">Po godzinach</h2>
                    <p className="sec-body">
                        Praca to nie wszystko — Hiszpania dała naszym uczniom niezapomniane chwile
                        i przyjaźnie na całe życie.
                    </p>
                    <div className="gallery">
                        {GALLERY_IMAGES.map((file, i) => (
                            <div className="gal-item" key={file.fileId}>
                                <img src={getImageUrl(file.filePath, { width: 800 })} alt={`Galeria ${i + 1}`} loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3 */}
            <section id="o-projekcie" className="sec s-blue">
                <div className="inner">
                    <p className="eyebrow">O projekcie</p>
                    <h2 className="sec-title">Erasmus+<br />w Technikum nr. 3</h2>
                    <div className="two-col">
                        <div>
                            <p className="sec-body">
                                Program Erasmus+ umożliwia naszym uczniom zdobycie praktycznego
                                doświadczenia zawodowego za granicą — rozwijając kompetencje językowe,
                                kulturowe i branżowe w prawdziwym środowisku pracy.
                            </p>
                            <p className="sec-body" style={{marginTop:'1rem'}}>
                                Wyjazdy realizowane są we współpracy z partnerami na Costa del Sol.
                                Każdy staż jest w pełni finansowany ze środków unijnych.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4 */}
            <section id="prezentacje" className="sec s-white">
                <div className="inner">
                    <p className="eyebrow">Dokumentacja</p>
                    <h2 className="sec-title">Prezentacje stażowe</h2>
                    <p className="sec-body">Zespoły z obu roczników przygotowały prezentacje podsumowujące swoje pobyty.</p>
                    <div className="pdf-grid">
                        {[
                            ...staze2526Pdfs.slice(0, 5),
                            ...staze2425Pdfs.slice(0, 5)
                        ].map((file) => (
                            <a
                                className="pdf-card"
                                key={file.fileId}
                                href={getFileUrl(file.filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={getPdfPageThumbnail(file.filePath, 1, { width: 600 })}
                                    alt={file.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        img.onerror = null;
                                        img.src =
                                            'data:image/svg+xml;utf8,' +
                                            encodeURIComponent(
                                                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
                                        <rect width="600" height="400" fill="#e8eef9"/>
                                        <text x="300" y="210" font-family="Arial, sans-serif"
                                              font-size="64" font-weight="700" fill="#0048b6"
                                              text-anchor="middle">PDF</text>
                                    </svg>`
                                            );
                                    }}
                                />
                                <div className="pdf-label">
                                    {file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ')}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer id="kontakt">
                <div className="foot-inner" style={{
                    gridTemplateColumns: stronaStartowaFile ? '2fr 1fr 1fr 1.2fr' : '2fr 1fr 1fr'
                }}>
                    <div>
                        <div className="foot-brand">Erasmus&nbsp;<span>España</span></div>
                        <p className="foot-desc">
                            Projekt realizowany w ramach programu Erasmus+ przez Technikum nr. 3 w Malborku.
                            Wszelkie materiały są własnością szkoły.
                        </p>
                    </div>
                    <div className="foot-col">
                        <h4>Nawigacja</h4>
                        <ul>{NAV_LINKS.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}</ul>
                    </div>
                    <div className="foot-col">
                        <h4>Kontakt</h4>
                        <address>
                            Technikum nr. 3 w Malborku<br />
                            al. Wojska Polskiego 502<br />
                            82-200 Malbork<br /><br />

                            tel. (55) 646 06 30 <br />
                            <a href="mailto:dyrektor@tech3.malbork.pl">dyrektor@tech3.malbork.pl</a>
                        </address>
                    </div>

                    {/* PDF IMAGE COMPONENT PLACEHOLDER ON THE RIGHT SIDE */}
                    {stronaStartowaFile && (
                        <div className="foot-col" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h4>Dokument zaświadczający</h4>
                            <a
                                href={getFileUrl(stronaStartowaFile.filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'block',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <img
                                    src={getPdfPageThumbnail(stronaStartowaFile.filePath, 1, { width: 350 })}
                                    alt="Strona startowa PDF"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        img.onerror = null;
                                        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
                                            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
                                                <rect width="300" height="400" fill="#e8eef9"/>
                                                <text x="150" y="210" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#0048b6" text-anchor="middle">PDF</text>
                                            </svg>`
                                        );
                                    }}
                                />
                            </a>
                        </div>
                    )}
                </div>
                <div className="foot-bottom">
                    <span>© {new Date().getFullYear()} Erasmus+ España — Wszelkie prawa zastrzeżone</span>
                    <span>Finansowane ze środków Unii Europejskiej 🇪🇺</span>
                    <span>Projekt strony i wykonanie: Aleksander J. oraz Kuba R.</span>
                </div>
            </footer>
        </>
    );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function Home() {
    const [view, setView] = useState<PageView>({ type: 'home' });
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Efekt do obsługi zmiany wysokości paska przy skrolowaniu
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const goTo = (v: PageView) => {
        setView(v);
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f5f7fa', minHeight: '100vh' }}>
            {/* Wstrzyknięcie globalnych stylów CSS (aby działały na wszystkich podstronach) */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght=600;700;800&family=Inter:wght@400;500;600&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { font-family: 'Inter', system-ui, sans-serif; background: #f5f7fa; color: #1a1a2e; overflow-x: hidden; }
                :root {
                  --blue:       #0048b6; --blue-dark:  #00338a; --blue-deep:  #001f5c; --blue-light: #e8eef9;
                  --white:      #ffffff; --off-white:  #f5f7fa; --text-main:  #1a1a2e; --text-muted: #4a5568;
                  --radius:     12px; --nav-h:      68px; --stripe-shadow: 0 8px 32px rgba(0,72,182,0.13), 0 2px 6px rgba(0,0,0,0.06);
                }
                .navbar {
                  position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between;
                  padding: 0 2.5rem; height: var(--nav-h); background: rgba(0,72,182,0.93); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
                  border-bottom: 1px solid rgba(255,255,255,0.09); transition: height .3s, background .3s;
                }
                .navbar.scrolled { height: 52px; background: rgba(0,51,138,0.98); }
                .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.35rem; color: #fff; text-decoration: none; letter-spacing: .05em; text-transform: uppercase; flex-shrink: 0; }
                .nav-logo span { color: #7eb3ff; }
                .edition-switcher { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.18); border-radius: 8px; padding: 4px; flex-shrink: 0; }
                .edition-btn { font-family: 'Barlow Condensed', sans-serif; font-size: .82rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.6); background: none; border: none; cursor: pointer; padding: .35rem .75rem; border-radius: 6px; transition: background .2s, color .2s; white-space: nowrap; }
                .edition-btn:hover { color: rgba(255,255,255,.9); background: rgba(255,255,255,.08); }
                .edition-btn.active { background: rgba(255,255,255,.18); color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
                .nav-links { display: flex; gap: 1.75rem; list-style: none; }
                .nav-links a { color: rgba(255,255,255,.82); text-decoration: none; font-size: .88rem; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; padding-bottom: 2px; border-bottom: 2px solid transparent; transition: color .2s, border-color .2s; }
                .nav-links a:hover { color: #fff; border-bottom-color: rgba(255,255,255,.45); }
                .burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
                .burger span { display: block; width: 26px; height: 2px; background: white; border-radius: 2px; transition: all .25s; }
                .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
                .burger.open span:nth-child(2) { opacity: 0; }
                .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
                .mob-menu { display: none; position: fixed; top: var(--nav-h); left: 0; right: 0; z-index: 99; background: rgba(0,25,76,.97); backdrop-filter: blur(16px); padding: 1.5rem 2rem 2rem; flex-direction: column; gap: 1.1rem; border-bottom: 1px solid rgba(255,255,255,.08); }
                .mob-menu.open { display: flex; }
                .mob-menu a { color: rgba(255,255,255,.9); text-decoration: none; font-family: 'Barlow Condensed', sans-serif; font-size: 1.65rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; transition: color .2s; }
                .mob-menu a:hover { color: #fff; }
                .mob-edition-switcher { display: flex; gap: 8px; margin-bottom: .5rem; }
                .mob-edition-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.55); background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: 8px; cursor: pointer; padding: .45rem 1.1rem; transition: background .2s, color .2s; }
                .mob-edition-btn.active { background: rgba(255,255,255,.18); color: #fff; border-color: rgba(255,255,255,.3); }
                @media (max-width: 768px) { .nav-links { display: none; } .burger { display: flex; } .edition-switcher { display: none; } }
            `}</style>

            {/* SPÓJNY NAVBAR DLA CAŁEJ STRONY */}
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
                <button onClick={() => goTo({ type: 'home' })} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} className="nav-logo">
                    Erasmus&nbsp;<span>España</span>
                </button>

                <div className="edition-switcher">
                    <button className={`edition-btn${view.type === 'home' ? ' active' : ''}`} onClick={() => goTo({ type: 'home' })}>Home</button>
                    <button className={`edition-btn${view.type === 'edition' && view.edition === '2425' ? ' active' : ''}`} onClick={() => goTo({ type: 'edition', edition: '2425' })}>2024/2025</button>
                    <button className={`edition-btn${view.type === 'edition' && view.edition === '2526' ? ' active' : ''}`} onClick={() => goTo({ type: 'edition', edition: '2526' })}>2025/2026</button>
                </div>

                {/* Linki kotwiczne wyświetlają się i działają tylko na stronie głównej */}
                <ul className="nav-links" style={{ visibility: view.type === 'home' ? 'visible' : 'hidden' }}>
                    {NAV_LINKS.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
                </ul>

                <button className={`burger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                    <span /><span /><span />
                </button>
            </nav>

            {/* MOBILNE MENU */}
            <div className={`mob-menu${menuOpen ? ' open' : ''}`}>
                <div className="mob-edition-switcher">
                    <button className={`mob-edition-btn${view.type === 'home' ? ' active' : ''}`} onClick={() => goTo({ type: 'home' })}>Home</button>
                    <button className={`mob-edition-btn${view.type === 'edition' && view.edition === '2425' ? ' active' : ''}`} onClick={() => goTo({ type: 'edition', edition: '2425' })}>2024/2025</button>
                    <button className={`mob-edition-btn${view.type === 'edition' && view.edition === '2526' ? ' active' : ''}`} onClick={() => goTo({ type: 'edition', edition: '2526' })}>2025/2026</button>
                </div>
                {view.type === 'home' && NAV_LINKS.map(l => (
                    <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
                ))}
            </div>

            {/* RENDEROWANIE ODPOWIEDNIEGO WIDOKU */}
            {view.type === 'edition' ? (
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 20px 60px' }}>
                    <EditionView edition={view.edition} onBack={() => goTo({ type: 'home' })} />
                </div>
            ) : (
                <HomePage onNavigate={goTo} />
            )}
        </div>
    );
}