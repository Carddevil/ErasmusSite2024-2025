'use client';

import { useState, useEffect, useRef } from 'react';
import { DRIVE_FILES, getDriveImageUrl, getDriveFileUrl } from './lib/drive';

// ─── NAV LINKS — edit here ────────────────────────────────────────────────────
const NAV_LINKS = [
    { label: 'Staże',       href: '#staze'       },
    { label: 'Galeria',     href: '#galeria'      },
    { label: 'O projekcie', href: '#o-projekcie'  },
    { label: 'Prezentacje', href: '#prezentacje'  },
    { label: 'Kontakt',     href: '#kontakt'      },
];

// ─── HERO CAROUSEL IMAGES — swap IDs or add more ─────────────────────────────
const HERO_IMAGES = [
    DRIVE_FILES.staze2526_zdjecia.cerezoCabezudo_2,
    DRIVE_FILES.staze2526_zdjecia.colors_5,
    DRIVE_FILES.staze2526_zdjecia.chiringuito_2,
    DRIVE_FILES.staze2526_zdjecia.circulo_7,
    DRIVE_FILES.staze2526_zdjecia.hotelBali_2,
    DRIVE_FILES.staze2526_zdjecia.cerezoCabezudo_1,
];

// ─── INTERNSHIP CARDS ─────────────────────────────────────────────────────────
const INTERNSHIP_CARDS = [
    { name: 'Hotel Spirit',         location: 'Benalmádena', fileId: DRIVE_FILES.staze2526_zdjecia.hotelSpirit_1 },
    { name: 'Chiringuito Copacabana',location: 'Málaga',     fileId: DRIVE_FILES.staze2526_zdjecia.chiringuito_1 },
    { name: 'Colors Peluquería',    location: 'Torremolinos',fileId: DRIVE_FILES.staze2526_zdjecia.colors_1      },
    { name: 'Samsung Telemalaga',   location: 'Málaga',      fileId: DRIVE_FILES.staze2526_zdjecia.samsung_telemalaga_7 },
    { name: 'Círculo de Empresarios',location: 'Málaga',     fileId: DRIVE_FILES.staze2526_zdjecia.circulo_4    },
    { name: 'La Tómbola',           location: 'Benalmádena', fileId: DRIVE_FILES.staze2526_zdjecia.laTombola    },
];

// ─── GALLERY ──────────────────────────────────────────────────────────────────
const GALLERY_IMAGES = [
    DRIVE_FILES.galeria2526.whatsapp_20_58_26_9,
    DRIVE_FILES.galeria2526.impressions_12,
    DRIVE_FILES.galeria2526.impressions_3maj,
    DRIVE_FILES.galeria2526.whatsapp_23_57_0,
    DRIVE_FILES.galeria2526.impressions_10,
    DRIVE_FILES.galeria2526.whatsapp_20_58_25_4,
    DRIVE_FILES.galeria2526.impressions_29kwi_16_3,
    DRIVE_FILES.galeria2526.whatsapp_21_17_1,
];

export default function Home() {
    const [current, setCurrent]   = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setCurrent(c => (c + 1) % HERO_IMAGES.length), 4500);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

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
        }
        .nav-logo span { color: #7eb3ff; }

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

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .burger { display: flex; }
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

        /* Frosted glass panel — diagonal clip at bottom for a flag/pennant feel */
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
        /* Each section sits like a stacked slab with a drop shadow and a
           coloured bottom edge pseudo-element for the depth illusion */
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
        }
        .pdf-card iframe { width: 100%; height: 195px; border: none; display: block; }
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
                <ul className="nav-links">
                    {NAV_LINKS.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
                </ul>
                <button className={`burger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                    <span /><span /><span />
                </button>
            </nav>

            {/* MOBILE MENU */}
            <div className={`mob-menu${menuOpen ? ' open' : ''}`}>
                {NAV_LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>)}
            </div>

            {/* HERO */}
            <section className="hero">
                {HERO_IMAGES.map((id, i) => (
                    <div
                        key={id}
                        className={`slide${i === current ? ' active' : ''}`}
                        style={{ backgroundImage: `url(${getDriveImageUrl(id, 1200)})` }}
                    />
                ))}
                <div className="hero-overlay" />

                <div className="hero-panel">
                    <div className="logo-spot">Logo</div>
                    <h1 className="hero-title">Nasze<br /><em>Staże</em><br />w Hiszpanii</h1>
                    <p className="hero-sub">Program Erasmus+ · Málaga 2025–2026</p>
                    <a href="#staze" className="hero-btn">Poznaj miejsca</a>
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
                    <p className="eyebrow">Erasmus+ 2025–2026</p>
                    <h2 className="sec-title">Nasze miejsca stażu</h2>
                    <p className="sec-body">
                        W roku szkolnym 2025/2026 nasi uczniowie odbyli staże zawodowe w renomowanych
                        firmach na Costa del Sol. Poznaj miejsca, które stały się ich tymczasowym domem.
                    </p>
                    <div className="cards">
                        {INTERNSHIP_CARDS.map(c => (
                            <div className="card" key={c.name}>
                                <img src={getDriveImageUrl(c.fileId, 600)} alt={c.name} loading="lazy" />
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
                        {GALLERY_IMAGES.map((id, i) => (
                            <div className="gal-item" key={id}>
                                <img src={getDriveImageUrl(id, 800)} alt={`Galeria ${i + 1}`} loading="lazy" />
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
                        {(Object.entries(DRIVE_FILES.staze2526_prezentacje) as [string, string][])
                            .filter(([k]) => k.endsWith('_pdf'))
                            .slice(0, 6)
                            .map(([key, id]) => (
                                <div className="pdf-card" key={key}>
                                    <iframe src={getDriveFileUrl(id)} title={key} allowFullScreen />
                                    <div className="pdf-label">{key.replace(/_pdf$/, '').replace(/_/g, ' ')}</div>
                                </div>
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