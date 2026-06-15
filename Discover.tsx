// Answer-first FAQ content. Single source of truth: rendered visibly in the UI
// AND mirrored in index.html FAQPage JSON-LD. Schema must reflect VISIBLE content,
// so keep these in sync (or prerender — see CLAUDE.md AEO note).

export interface QA {
  readonly q: string;
  readonly a: string;
}

export const faq: readonly QA[] = [
  {
    q: 'What is Welcome to the Table?',
    a: 'Welcome to the Table is a Houston app for discovering verified Black-owned restaurants and stores near you, with community-vouched welcoming spaces and a guide to the historic Black Wall Street districts. The promise is simple: everybody gets a seat at the table.',
  },
  {
    q: 'What are some of the best Black-owned restaurants in Houston?',
    a: 'Popular verified Black-owned restaurants in Houston include The Breakfast Klub in Midtown, Lucille\u2019s near the Museum District, and Mikki\u2019s Soul Food Cafe in Third Ward. Listings show real-time hours and a verification status so you know the ownership has been confirmed.',
  },
  {
    q: 'How does Welcome to the Table verify that a business is Black-owned?',
    a: 'Ownership is community-verified. A listing moves from candidate to community-reported to verified once an owner confirms it or three independent community members confirm it. Every listing displays its current verification status, and no business is published on the word of AI alone.',
  },
  {
    q: 'Does it cover Black-owned businesses outside the city, like Pearland or Missouri City?',
    a: 'Yes. The default view shows spots within a 10-mile radius, and a Greater Houston toggle expands coverage across the metro \u2014 Pearland, Missouri City, Spring, Sugar Land, and surrounding areas.',
  },
  {
    q: 'What does the Welcome badge mean?',
    a: 'The Welcome badge means community members have vouched that a place is welcoming and that they were treated with respect. It is community testimony, not a safety guarantee, and the app never labels any place or area as dangerous.',
  },
  {
    q: 'Is Welcome to the Table available in Spanish and French?',
    a: 'Yes. The app is available in English, Spanish, and French, so visitors and residents across Greater Houston can use it in their own language.',
  },
];
