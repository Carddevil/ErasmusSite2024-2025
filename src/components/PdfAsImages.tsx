'use client';

import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';


pdfjsLib.GlobalWorkerOptions.workerSrc =
    new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();

export default function PdfAsImages({ url }: { url: string }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const pdf = await pdfjsLib.getDocument(url).promise;

                if (!containerRef.current) return;
                containerRef.current.innerHTML = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    if (cancelled) return;

                    const page = await pdf.getPage(i);

                    const viewport = page.getViewport({ scale: 1.5 });

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) return;

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvas,
                        canvasContext: ctx,
                        viewport,
                    }).promise;

                    canvas.style.width = '100%';
                    canvas.style.marginBottom = '16px';
                    canvas.style.borderRadius = '8px';

                    containerRef.current.appendChild(canvas);
                }
            } catch (err) {
                console.error('PDF render error:', err);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [url]);

    return <div ref={containerRef} />;
}