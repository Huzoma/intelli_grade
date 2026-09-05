"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Native Next.js 15 / Turbopack worker configuration (No external CDNs)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ fileUrl, zoom }) {
  const [numPages, setNumPages] = useState(null);

  return (
    <div className="flex flex-col items-center select-text w-full">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="animate-pulse flex space-x-4 p-12 w-full justify-center">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-64"></div>
          </div>
        }
        error={
          <div className="text-danger font-semibold p-8 text-center bg-danger-bg/20 rounded-lg border border-danger-border mt-10">
            Failed to load PDF. Please ensure the cloud file URL is accessible.
          </div>
        }
        className="flex flex-col items-center gap-6 w-full"
      >
        {Array.from(new Array(numPages || 0), (el, index) => (
          <div 
            key={`page_${index + 1}`} 
            className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white overflow-hidden relative"
          >
            <Page 
              pageNumber={index + 1} 
              width={800 * (zoom / 100)}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}