/**
 * CareNest Visual Design System — Typography Tokens
 * Headings: Nunito (friendly, rounded, high legibility)
 * Section Titles: Poppins (geometric, clean)
 * Body: Inter (crisp, accessible)
 */

export const typography = {
  fonts: {
    heading: 'Nunito, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    title: 'Poppins, system-ui, sans-serif',
  },
  sizes: {
    display: 'text-3xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight tracking-tight',
    h1: 'text-2xl sm:text-3xl font-extrabold font-heading leading-tight tracking-tight text-ink-main',
    h2: 'text-xl sm:text-2xl font-bold font-heading leading-snug text-ink-main',
    h3: 'text-lg sm:text-xl font-bold font-heading leading-snug text-ink-main',
    h4: 'text-base sm:text-lg font-bold font-heading text-ink-main',
    sectionTitle: 'text-base sm:text-lg font-bold font-title tracking-tight text-ink-main',
    bodyLarge: 'text-base sm:text-lg font-normal font-body leading-relaxed text-ink-main',
    body: 'text-sm sm:text-base font-normal font-body leading-relaxed text-ink-main',
    bodySmall: 'text-xs sm:text-sm font-medium font-body leading-normal text-ink-secondary',
    caption: 'text-xs font-semibold font-body text-ink-muted uppercase tracking-wider',
  }
} as const;

