"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export interface Highlight {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export function PdfViewer({
  url,
  page,
  highlight,
}: {
  url: string;
  page: number;
  highlight: Highlight | null;
}) {
  const [ready, setReady] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () =>
      setWidth(Math.min(760, Math.max(320, el.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-[760px]">
      <div
        className="relative mx-auto overflow-hidden rounded-sm border border-slate-300 bg-white shadow-raised"
        style={{ width }}
      >
        <Document
          file={url}
          loading={
            <div
              className="flex items-center justify-center text-xs text-ink-faint"
              style={{ height: width * 1.29 }}
            >
              Loading policy document…
            </div>
          }
          error={
            <div className="flex h-64 items-center justify-center text-xs text-red-700">
              The policy PDF could not be rendered.
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => setReady(true)}
          />
        </Document>
        {ready && highlight && (
          <div
            aria-label={`Cited source language: ${highlight.label}`}
            className="pointer-events-none absolute rounded-sm bg-amber-300/30 ring-2 ring-amber-500"
            style={{
              left: `${highlight.x * 100}%`,
              top: `${highlight.y * 100}%`,
              width: `${highlight.w * 100}%`,
              height: `${highlight.h * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default PdfViewer;
