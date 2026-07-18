// Minimal 20px stroke icon set (1.5px stroke, round caps) for navigation and controls.
import type { SVGProps } from "react";

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="11" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="11" width="6" height="6" rx="1" />
    <rect x="11" y="11" width="6" height="6" rx="1" />
  </Base>
);

export const IconPractices = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M3 17h14M4 17V7.5L10 3l6 4.5V17" />
    <path d="M8 17v-4h4v4" />
  </Base>
);

export const IconDocReview = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M11.5 2.5H5.5A1.5 1.5 0 0 0 4 4v12a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 16V7l-4.5-4.5Z" />
    <path d="M11.5 2.5V7H16M7 11l1.8 1.8L12.5 9" />
  </Base>
);

export const IconGap = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M10 3.2 2.8 16h14.4L10 3.2Z" />
    <path d="M10 8.5v3.2M10 14.2h.01" />
  </Base>
);

export const IconReports = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M6 2.5h8A1.5 1.5 0 0 1 15.5 4v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 16V4A1.5 1.5 0 0 1 6 2.5Z" />
    <path d="M7.5 6h5M7.5 9h5M7.5 12h3" />
  </Base>
);

export const IconLibrary = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M4 3.5h4.5A1.5 1.5 0 0 1 10 5v11.5M10 5a1.5 1.5 0 0 1 1.5-1.5H16V15h-4.5A1.5 1.5 0 0 0 10 16.5" />
    <path d="M4 3.5V15h4.5a1.5 1.5 0 0 1 1.5 1.5" />
  </Base>
);

export const IconRules = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M10 2.5 16.5 5v5.2c0 4.3-2.9 7.3-6.5 8.8-3.6-1.5-6.5-4.5-6.5-8.8V5L10 2.5Z" />
    <path d="M7.5 10l1.8 1.8 3.2-3.6" />
  </Base>
);

export const IconSettings = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="10" cy="10" r="2.5" />
    <path d="M10 2.8v2M10 15.2v2M2.8 10h2M15.2 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4" />
  </Base>
);

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="m13.2 13.2 3.6 3.6" />
  </Base>
);

export const IconBell = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 3.4-1 4.6-1.7 5.5h12.4c-.7-.9-1.7-2.1-1.7-5.5A4.5 4.5 0 0 0 10 3ZM8.3 15.8a1.8 1.8 0 0 0 3.4 0" />
  </Base>
);

export const IconUpload = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M10 12.5v-8M6.8 7.2 10 4l3.2 3.2M4 13.5V15a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 15v-1.5" />
  </Base>
);

export const IconChevronLeft = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="m12 4-6 6 6 6" />
  </Base>
);

export const IconChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="m8 4 6 6-6 6" />
  </Base>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="m4 10.5 4 4 8-9" />
  </Base>
);

export const IconEdit = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M13.6 3.6a1.9 1.9 0 0 1 2.8 2.8L7 15.8l-3.8 1 1-3.8 9.4-9.4Z" />
  </Base>
);

export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="m5 5 10 10M15 5 5 15" />
  </Base>
);

export const IconDownload = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M10 4v8M6.8 8.8 10 12l3.2-3.2M4 13.5V15a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 15v-1.5" />
  </Base>
);
