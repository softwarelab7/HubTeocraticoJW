import { jsPDF } from 'jspdf';

/**
 * Exports the #pdf-content element to a single-page downloadable PDF.
 *
 * Strategy (v6 — no double-scaling):
 *  1. Measure the real scrollHeight of #pdf-content.
 *  2. Calculate the windowWidth needed so that BOTH the width and height
 *     of the content fit inside a Letter page (612 × 792 pt).
 *  3. Let jsPDF.html() handle ALL scaling via its width/windowWidth ratio.
 *     NO manual CSS transform is applied — this avoids the double-scaling bug.
 *  4. Force html2canvas scale: 1 to neutralize Windows High-DPI (125%/150%).
 *
 * @param filename - Desired file name (without .pdf extension)
 */
export async function exportToPDF(filename: string = 'programacion'): Promise<void> {
    const element = document.getElementById('pdf-content');
    if (!element) {
        console.error('[pdfExport] #pdf-content not found.');
        return;
    }

    // ── 1. Prepare DOM for clean capture ─────────────────────────────────
    const printHiddenEls = document.querySelectorAll<HTMLElement>('.print\\:hidden');
    const originalDisplays: string[] = [];
    printHiddenEls.forEach((el, i) => {
        originalDisplays[i] = el.style.display;
        el.style.display = 'none';
    });

    const originalTransform = element.style.transform;
    const originalBoxShadow = element.style.boxShadow;
    element.style.transform = 'none';
    element.style.boxShadow = 'none';

    const datalist = document.querySelector<HTMLElement>('datalist');
    if (datalist) datalist.style.display = 'none';

    try {
        // ── 2. Measure content ───────────────────────────────────────────
        const designWidthPx   = 816;                          // Our fixed design width
        const contentHeightPx = element.scrollHeight;         // Real rendered height

        // Letter page in points (72 dpi)
        const pageWidthPt  = 612;
        const pageHeightPt = 792;

        // Usable area (small margins: 10pt left/right, 10pt top/bottom)
        const marginX       = 10;
        const marginY       = 10;
        const usableWidthPt  = pageWidthPt  - (marginX * 2);  // 592 pt
        const usableHeightPt = pageHeightPt - (marginY * 2);  // 772 pt

        // ── 3. Calculate windowWidth for single-page fit ─────────────────
        // jsPDF.html() scales content by: scale = width / windowWidth
        // Rendered width  in PDF = designWidthPx  × scale = width (always fits)
        // Rendered height in PDF = contentHeightPx × scale
        //
        // For height to fit: contentHeightPx × (usableWidthPt / windowWidth) ≤ usableHeightPt
        // So:                windowWidth ≥ contentHeightPx × usableWidthPt / usableHeightPt
        //
        // Also windowWidth must be ≥ designWidthPx (never enlarge content)

        const windowWidthForHeight = Math.ceil(
            (contentHeightPx * usableWidthPt) / usableHeightPt
        );
        const windowWidth = Math.max(designWidthPx, windowWidthForHeight);

        // Actual scale that will be applied
        const actualScale = usableWidthPt / windowWidth;
        const renderedWidthPt  = designWidthPx * actualScale;
        const renderedHeightPt = contentHeightPx * actualScale;

        // Center horizontally on the page
        const xOffset = (pageWidthPt - renderedWidthPt) / 2;

        console.log(
            `[pdfExport v6] content=${designWidthPx}×${contentHeightPx}px | ` +
            `windowWidth=${windowWidth} | scale=${actualScale.toFixed(4)} | ` +
            `rendered=${renderedWidthPt.toFixed(0)}×${renderedHeightPt.toFixed(0)}pt`
        );

        // ── 4. Create jsPDF document ─────────────────────────────────────
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'letter',
            compress: true,
        });

        // ── 5. Render (jsPDF handles all scaling internally) ─────────────
        await pdf.html(element, {
            callback: (doc) => {
                doc.save(`${filename}.pdf`);
            },
            x: xOffset,
            y: marginY,
            width: usableWidthPt,
            windowWidth: windowWidth,
            margin: [0, 0, 0, 0],
            autoPaging: false,
            html2canvas: {
                scale: 1,            // Neutralize device pixel ratio (High-DPI fix)
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                removeContainer: true,
                scrollX: 0,
                scrollY: -window.scrollY,  // Capture from top, not current scroll
            },
        });

    } finally {
        // ── 6. Restore original DOM state ────────────────────────────────
        element.style.transform = originalTransform;
        element.style.boxShadow = originalBoxShadow;
        printHiddenEls.forEach((el, i) => {
            el.style.display = originalDisplays[i];
        });
        if (datalist) datalist.style.display = '';
    }
}
