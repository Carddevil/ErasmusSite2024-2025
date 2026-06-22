import { useState, useEffect, useRef, useMemo } from 'react';
import { useFiles, folder, onlyImages, onlyPdfs, findByName, type ImageKitFile } from '../lib/useFiles';
import { getImageUrl, getFileUrl, getPdfPageThumbnail } from '../lib/imagekit';

// ─── EDITION TYPE ─────────────────────────────────────────────────────────────
type Edition = '2526' | '2425';

// ─── NAV LINKS — edit here ────────────────────────────────────────────────────
const NAV_LINKS = [
    { label: 'Staże',       href: '#staze'       },
    { label: 'Galeria',     href: '#galeria'      },
    { label: 'O projekcie', href: '#o-projekcie'  },
    { label: 'Prezentacje', href: '#prezentacje'  },
    { label: 'Kontakt',     href: '#kontakt'      },
];

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

// ─── CARD DEFS per edition ────────────────────────────────────────────────────
const CARD_DEFS_2526 = [
    { name: 'Hotel Spirit',           location: 'Benalmádena',  match: 'Hotel Spirit' },
    { name: 'Chiringuito Copacabana', location: 'Málaga',       match: 'Chiringuito Copacabana' },
    { name: 'Colors Peluquería',      location: 'Torremolinos', match: 'Colors productos' },
    { name: 'Samsung Telemalaga',     location: 'Málaga',       match: 'Samsung' },
    { name: 'Círculo de Empresarios', location: 'Málaga',       match: 'Circulo de Empresarios' },
    { name: 'La Tómbola',             location: 'Benalmádena',  match: 'La Tómbola' },
];

const CARD_DEFS_2425 = [
    { name: 'Brunch IT',                  location: 'Málaga',        match: 'Brunch IT' },
    { name: 'Forja Roja',                 location: 'Torremolinos',  match: 'Forja Roja' },
    { name: 'Hotel Bali – Dorsol S.A.',   location: 'Benalmádena',   match: 'Hotel Bali' },
    { name: 'Feel Hostel Soho Málaga',    location: 'Málaga',        match: 'Feel Hostel' },
    { name: 'JD Spain Sports Fashion',    location: 'Málaga',        match: 'JD Spain' },
    { name: 'Eurocosta 2013 SL',          location: 'Costa del Sol', match: 'Eurocosta' },
    { name: 'iDevelop Training S.L.',     location: 'Málaga',        match: 'iDevelop' },
    { name: 'Clínica de Podología',       location: 'Torremolinos',  match: 'Clínica de Podología' },
];

// ─── EDITION CONFIG ────────────────────────────────────────────────────────────
const EDITION_CONFIG = {
    '2526': {
        label:       '2025/2026',
        heroSub:     'Program Erasmus+ · Málaga 2025–2026',
        heroBtn:     'Poznaj miejsca',
        eyebrow:     'Erasmus+ 2025–2026',
        bodyText:    'W roku szkolnym 2025/2026 nasi uczniowie odbyli staże zawodowe w renomowanych firmach na Costa del Sol. Poznaj miejsca, które stały się ich tymczasowym domem.',
        cardDefs:    CARD_DEFS_2526,
        photoFolder: 'staze2526_zdjecia'  as const,
        pdfFolder:   'staze2526_prezentacje' as const,
        galFolder:   'galeria2526' as const,
    },
    '2425': {
        label:       '2024/2025',
        heroSub:     'Program Erasmus+ · Málaga 2024–2025',
        heroBtn:     'Poznaj miejsca',
        eyebrow:     'Erasmus+ 2024–2025',
        bodyText:    'W roku szkolnym 2024/2025 nasi uczniowie odbyli staże zawodowe w renomowanych firmach na Costa del Sol. Poznaj miejsca, które stały się ich tymczasowym domem.',
        cardDefs:    CARD_DEFS_2425,
        photoFolder: 'staze2425_zdjecia'  as const,
        pdfFolder:   'staze2425_prezentacje' as const,
        galFolder:   'galeria2425' as const,
    },
};

export default function Home() {
    const { byFolder, loading, error } = useFiles();

    const [edition, setEdition]       = useState<Edition>('2526');
    const [current, setCurrent]       = useState(0);
    const [menuOpen, setMenuOpen]     = useState(false);
    const [scrolled, setScrolled]     = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const cfg = EDITION_CONFIG[edition];

    // ─── Derive image/PDF sets from the live ImageKit file list ────────────
    const staze2526Photos = useMemo(
        () => onlyImages(folder(byFolder, FOLDERS.staze2526_zdjecia)),
        [byFolder]
    );
    const staze2425Photos = useMemo(
        () => onlyImages(folder(byFolder, FOLDERS.staze2425_zdjecia)),
        [byFolder]
    );
    const staze2526Pdfs = useMemo(
        () => onlyPdfs(folder(byFolder, FOLDERS.staze2526_prezentacje)),
        [byFolder]
    );
    const staze2425Pdfs = useMemo(
        () => onlyPdfs(folder(byFolder, FOLDERS.staze2425_prezentacje)),
        [byFolder]
    );
    const galeria2526Photos = useMemo(
        () => onlyImages(folder(byFolder, FOLDERS.galeria2526)),
        [byFolder]
    );
    const galeria2425Photos = useMemo(
        () => onlyImages(folder(byFolder, FOLDERS.galeria2425)),
        [byFolder]
    );

    // Active-edition data
    const activePhotos = edition === '2526' ? staze2526Photos : staze2425Photos;
    const activePdfs   = edition === '2526' ? staze2526Pdfs   : staze2425Pdfs;
    const activeGal    = edition === '2526' ? galeria2526Photos : galeria2425Photos;

    // Hero carousel: first 6 photos from the active staże gallery
    const HERO_IMAGES = useMemo(() => activePhotos.slice(0, 6), [activePhotos]);

    // Internship cards
    const INTERNSHIP_CARDS = useMemo(
        () =>
            cfg.cardDefs.map((c) => ({
                ...c,
                file: findByName(activePhotos, c.match) ?? activePhotos[0],
            })).filter((c) => c.file),
        [activePhotos, cfg.cardDefs]
    );

    // Gallery: first 8 photos
    const GALLERY_IMAGES = useMemo(() => activeGal.slice(0, 8), [activeGal]);

    // Reset carousel when edition changes
    useEffect(() => {
        setCurrent(0);
    }, [edition]);

    useEffect(() => {
        if (HERO_IMAGES.length === 0) return;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCurrent(c => (c + 1) % HERO_IMAGES.length), 4500);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [HERO_IMAGES.length, edition]);

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

    const switchEdition = (ed: Edition) => {
        setEdition(ed);
        setMenuOpen(false);
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
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'sans-serif', color: '#0048b6', fontSize: '1.1rem',
            }}>
                Ładowanie galerii…
            </div>
        );
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #f5f7fa;
          color: #1a1a2e;
          overflow-x: hidden;
        }

        :root {
          --blue:       #0048b6;
          --blue-dark:  #00338a;
          --blue-deep:  #001f5c;
          --blue-light: #e8eef9;
          --white:      #ffffff;
          --off-white:  #f5f7fa;
          --text-main:  #1a1a2e;
          --text-muted: #4a5568;
          --radius:     12px;
          --nav-h:      68px;
          --stripe-shadow: 0 8px 32px rgba(0,72,182,0.13), 0 2px 6px rgba(0,0,0,0.06);
        }

        /* ── NAVBAR ───────────────────────────────────────────────── */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem;
          height: var(--nav-h);
          background: rgba(0,72,182,0.93);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.09);
          transition: height .3s, background .3s;
        }
        .navbar.scrolled { height: 52px; background: rgba(0,51,138,0.98); }

        .nav-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800; font-size: 1.35rem;
          color: #fff; text-decoration: none;
          letter-spacing: .05em; text-transform: uppercase;
          flex-shrink: 0;
        }
        .nav-logo span { color: #7eb3ff; }

        /* ── EDITION SWITCHER ─────────────────────────────────────── */
        .edition-switcher {
          display: flex; align-items: center; gap: 4px;
          background: rgba(0,0,0,0.18);
          border-radius: 8px;
          padding: 4px;
          flex-shrink: 0;
        }
        .edition-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .82rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(255,255,255,.6);
          background: none; border: none; cursor: pointer;
          padding: .35rem .75rem;
          border-radius: 6px;
          transition: background .2s, color .2s;
          white-space: nowrap;
        }
        .edition-btn:hover { color: rgba(255,255,255,.9); background: rgba(255,255,255,.08); }
        .edition-btn.active {
          background: rgba(255,255,255,.18);
          color: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,.2);
        }

        .nav-links { display: flex; gap: 1.75rem; list-style: none; }
        .nav-links a {
          color: rgba(255,255,255,.82); text-decoration: none;
          font-size: .88rem; font-weight: 500;
          letter-spacing: .04em; text-transform: uppercase;
          padding-bottom: 2px;
          border-bottom: 2px solid transparent;
          transition: color .2s, border-color .2s;
        }
        .nav-links a:hover { color: #fff; border-bottom-color: rgba(255,255,255,.45); }

        .burger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 6px;
        }
        .burger span {
          display: block; width: 26px; height: 2px;
          background: white; border-radius: 2px; transition: all .25s;
        }
        .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .burger.open span:nth-child(2) { opacity: 0; }
        .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .mob-menu {
          display: none;
          position: fixed; top: var(--nav-h); left: 0; right: 0; z-index: 99;
          background: rgba(0,25,76,.97); backdrop-filter: blur(16px);
          padding: 1.5rem 2rem 2rem;
          flex-direction: column; gap: 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .mob-menu.open { display: flex; }
        .mob-menu a {
          color: rgba(255,255,255,.9); text-decoration: none;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.65rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
          transition: color .2s;
        }
        .mob-menu a:hover { color: #fff; }

        /* Edition switcher in mobile menu */
        .mob-edition-switcher {
          display: flex; gap: 8px; margin-bottom: .5rem;
        }
        .mob-edition-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(255,255,255,.55);
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px;
          cursor: pointer;
          padding: .45rem 1.1rem;
          transition: background .2s, color .2s;
        }
        .mob-edition-btn.active {
          background: rgba(255,255,255,.18);
          color: #fff;
          border-color: rgba(255,255,255,.3);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .burger { display: flex; }
          .edition-switcher { display: none; }
        }

        /* ── HERO ─────────────────────────────────────────────────── */
        .hero {
          position: relative; height: 100svh; min-height: 560px; overflow: hidden;
        }
        .slide {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          opacity: 0; transition: opacity 1.2s ease;
        }
        .slide.active {
          opacity: 1;
          animation: zoom 7s ease forwards;
        }
        @keyframes zoom { from { transform: scale(1.04); } to { transform: scale(1); } }

        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(155deg,
            rgba(0,25,76,.5) 0%,
            rgba(0,72,182,.15) 50%,
            rgba(0,0,0,.6) 100%);
        }

        .hero-panel {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: min(520px, 88vw);
          background: rgba(255,255,255,.12);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 4px;
          padding: 2.75rem 2.75rem 3.5rem;
          text-align: center;
          clip-path: polygon(0 0, 100% 0, 100% 87%, 0 100%);
        }
        .logo-spot {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(255,255,255,.18);
          border: 2px dashed rgba(255,255,255,.35);
          margin: 0 auto 1.4rem;
          display: flex; align-items: center; justify-content: center;
          font-size: .6rem; color: rgba(255,255,255,.55);
          letter-spacing: .06em; text-transform: uppercase;
        }
        .hero-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800; line-height: 1.05;
          color: #fff; text-transform: uppercase;
          letter-spacing: .025em;
          text-shadow: 0 2px 20px rgba(0,0,0,.4);
        }
        .hero-title em { font-style: normal; color: #7eb3ff; }
        .hero-sub {
          margin-top: .6rem; font-size: .95rem;
          color: rgba(255,255,255,.75); letter-spacing: .04em;
        }
        .hero-btn {
          display: inline-block; margin-top: 1.75rem;
          padding: .7rem 2rem;
          background: var(--blue); color: #fff;
          font-weight: 600; font-size: .875rem;
          letter-spacing: .07em; text-transform: uppercase;
          text-decoration: none; border-radius: 3px;
          border: 1px solid rgba(255,255,255,.18);
          transition: background .2s, transform .15s;
        }
        .hero-btn:hover { background: var(--blue-dark); transform: translateY(-2px); }

        .dots {
          position: absolute; bottom: 2rem; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 10px;
        }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,.35);
          border: none; cursor: pointer; padding: 0;
          transition: background .3s, transform .3s;
        }
        .dot.active { background: #fff; transform: scale(1.45); }

        /* ── SECTION BASE ─────────────────────────────────────────── */
        .sec {
          position: relative;
          padding: 5rem 2rem;
        }
        .inner { max-width: 1100px; margin: 0 auto; }

        .eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .78rem; font-weight: 700;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--blue); margin-bottom: .4rem;
        }
        .sec-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800; line-height: 1.08;
          text-transform: uppercase; letter-spacing: .02em;
          color: var(--text-main);
        }
        .sec-body {
          margin-top: .85rem; font-size: 1rem;
          line-height: 1.75; color: var(--text-muted);
          max-width: 620px;
        }

        /* ── 3-D STRIPES ──────────────────────────────────────────── */
        .s-white {
          background: #fff;
          box-shadow: var(--stripe-shadow);
          z-index: 3; isolation: isolate;
        }
        .s-light {
          background: #eef3fb;
          box-shadow: var(--stripe-shadow);
          z-index: 2; isolation: isolate;
        }
        .s-blue {
          background: var(--blue);
          box-shadow: 0 10px 40px rgba(0,72,182,.45), 0 2px 8px rgba(0,0,0,.15);
          z-index: 1; isolation: isolate;
        }
        .s-white::after, .s-light::after, .s-blue::after {
          content: ''; position: absolute;
          bottom: -5px; left: 0; right: 0; height: 5px;
          z-index: -1;
        }
        .s-white::after { background: #d0d8e8; }
        .s-light::after { background: #c5d3e8; }
        .s-blue::after  { background: #00338a; }

        .s-blue .eyebrow   { color: rgba(255,255,255,.55); }
        .s-blue .sec-title { color: #fff; }
        .s-blue .sec-body  { color: rgba(255,255,255,.72); }

        /* ── CARDS ────────────────────────────────────────────────── */
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.5rem; margin-top: 2.5rem;
        }
        .card {
          border-radius: var(--radius); overflow: hidden;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,72,182,.09);
          transition: transform .25s, box-shadow .25s;
        }
        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 32px rgba(0,72,182,.18);
        }
        .card img {
          width: 100%; height: 200px; object-fit: cover; display: block;
        }
        .card-body { padding: 1rem 1.2rem; }
        .card-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .03em;
        }
        .card-loc {
          font-size: .8rem; color: var(--blue);
          font-weight: 600; margin-top: .25rem;
          letter-spacing: .05em; text-transform: uppercase;
        }

        /* ── GALLERY ──────────────────────────────────────────────── */
        .gallery {
          columns: 3; column-gap: 1rem; margin-top: 2.5rem;
        }
        .gal-item {
          break-inside: avoid; margin-bottom: 1rem;
          border-radius: 8px; overflow: hidden; display: block;
        }
        .gal-item img {
          width: 100%; display: block;
          transition: transform .35s;
        }
        .gal-item:hover img { transform: scale(1.05); }
        @media (max-width: 700px) { .gallery { columns: 2; } }
        @media (max-width: 420px) { .gallery { columns: 1; } }

        /* ── ABOUT / STATS ────────────────────────────────────────── */
        .two-col {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 3rem; margin-top: 2.5rem; align-items: start;
        }
        .stats { display: flex; flex-direction: column; gap: 1.5rem; }
        .stat { display: flex; align-items: baseline; gap: .6rem; }
        .stat-n {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 3rem; font-weight: 800;
          color: rgba(255,255,255,.95); line-height: 1;
        }
        .stat-l { font-size: .88rem; color: rgba(255,255,255,.62); }
        @media (max-width: 680px) { .two-col { grid-template-columns: 1fr; gap: 2rem; } }

        /* ── PDF CARDS ────────────────────────────────────────────── */
        .pdf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.25rem; margin-top: 2.5rem;
        }
        .pdf-card {
          border-radius: var(--radius); overflow: hidden;
          border: 1px solid rgba(0,72,182,.12);
          background: var(--blue-light);
          display: block; text-decoration: none;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .pdf-card:hover { transform: translateY(-3px); box-shadow: var(--stripe-shadow); }
        .pdf-card img { width: 100%; height: 195px; object-fit: cover; display: block; }
        .pdf-label {
          padding: .7rem 1rem; font-size: .78rem; font-weight: 600;
          color: var(--blue-dark); text-transform: uppercase;
          letter-spacing: .05em; background: #fff;
        }

        /* ── FOOTER ───────────────────────────────────────────────── */
        footer {
          background: var(--blue-deep);
          color: rgba(255,255,255,.78);
          padding: 4rem 2rem 2.5rem;
        }
        .foot-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 3rem;
        }
        .foot-brand {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.35rem; font-weight: 800;
          color: #fff; text-transform: uppercase;
          letter-spacing: .05em; margin-bottom: .7rem;
        }
        .foot-brand span { color: #7eb3ff; }
        .foot-desc {
          font-size: .87rem; line-height: 1.7;
          color: rgba(255,255,255,.5); max-width: 280px;
        }
        .foot-col h4 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .72rem; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase;
          color: rgba(255,255,255,.35); margin-bottom: .9rem;
        }
        .foot-col ul { list-style: none; display: flex; flex-direction: column; gap: .55rem; }
        .foot-col ul li a {
          color: rgba(255,255,255,.68); text-decoration: none;
          font-size: .9rem; transition: color .2s;
        }
        .foot-col ul li a:hover { color: #fff; }
        .foot-col address {
          font-style: normal; font-size: .9rem;
          color: rgba(255,255,255,.65); line-height: 1.85;
        }
        .foot-col address a {
          color: rgba(255,255,255,.65); text-decoration: none;
          transition: color .2s;
        }
        .foot-col address a:hover { color: #fff; }
        .foot-bottom {
          max-width: 1100px; margin: 2.5rem auto 0;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,.07);
          font-size: .78rem; color: rgba(255,255,255,.27);
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem;
        }
        @media (max-width: 680px) {
          .foot-inner { grid-template-columns: 1fr; gap: 2rem; }
          .foot-desc { max-width: none; }
        }

        /* ── Reduced motion ───────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .slide, .card, .gal-item img, .hero-btn { transition: none; animation: none; }
        }
      `}</style>

            {/* NAVBAR */}
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
                <a href="#" className="nav-logo">Erasmus&nbsp;<span>España</span></a>

                {/* Edition switcher — desktop */}
                <div className="edition-switcher">
                    <button
                        className={`edition-btn${edition === '2425' ? ' active' : ''}`}
                        onClick={() => switchEdition('2425')}
                    >
                        2024/25
                    </button>
                    <button
                        className={`edition-btn${edition === '2526' ? ' active' : ''}`}
                        onClick={() => switchEdition('2526')}
                    >
                        2025/26
                    </button>
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
                {/* Edition switcher — mobile */}
                <div className="mob-edition-switcher">
                    <button
                        className={`mob-edition-btn${edition === '2425' ? ' active' : ''}`}
                        onClick={() => switchEdition('2425')}
                    >
                        2024/2025
                    </button>
                    <button
                        className={`mob-edition-btn${edition === '2526' ? ' active' : ''}`}
                        onClick={() => switchEdition('2526')}
                    >
                        2025/2026
                    </button>
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
                    <div className="logo-spot">Logo</div>
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

            {/* SECTION 1 — internship cards (white slab) */}
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
                </div>
            </section>

            {/* SECTION 2 — gallery (light slab) */}
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

            {/* SECTION 3 — about / stats (blue slab) */}
            <section id="o-projekcie" className="sec s-blue">
                <div className="inner">
                    <p className="eyebrow">O projekcie</p>
                    <h2 className="sec-title">Erasmus+<br />w liczbach</h2>
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
                        <div className="stats">
                            <div className="stat"><span className="stat-n">40+</span><span className="stat-l">uczniów w programie</span></div>
                            <div className="stat"><span className="stat-n">12</span><span className="stat-l">firm partnerskich</span></div>
                            <div className="stat"><span className="stat-n">2</span><span className="stat-l">lata realizacji</span></div>
                            <div className="stat"><span className="stat-n">🇪🇸</span><span className="stat-l">Málaga · Benalmádena · Torremolinos</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4 — presentations (white slab) */}
            <section id="prezentacje" className="sec s-white">
                <div className="inner">
                    <p className="eyebrow">Dokumentacja</p>
                    <h2 className="sec-title">Prezentacje stażowe</h2>
                    <p className="sec-body">Każdy zespół przygotował prezentację podsumowującą swój pobyt.</p>
                    <div className="pdf-grid">
                        {activePdfs.map((file) => (
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
                <div className="foot-inner">
                    <div>
                        <div className="foot-brand">Erasmus&nbsp;<span>España</span></div>
                        <p className="foot-desc">
                            Projekt realizowany w ramach programu Erasmus+ przez Zespół Szkół Zawodowych.
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
                            {/* ← edytuj dane kontaktowe */}
                            Zespół Szkół Zawodowych<br />
                            ul. Przykładowa 1<br />
                            00-000 Miasto<br /><br />
                            <a href="mailto:erasmus@szkola.pl">erasmus@szkola.pl</a>
                        </address>
                    </div>
                </div>
                <div className="foot-bottom">
                    <span>© {new Date().getFullYear()} Erasmus+ España — Wszelkie prawa zastrzeżone</span>
                    <span>Finansowane ze środków Unii Europejskiej 🇪🇺</span>
                </div>
            </footer>
        </>
    );
}
