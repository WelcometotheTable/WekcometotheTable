import type { Business } from '../types/business.ts';

// Real businesses from the live Google Places pull (June 2026), for local dev
// before the Supabase data layer is wired. Distances are illustrative.
// Verification + welcome flags here are placeholders; production reads from the DB.
export const sampleBusinesses: readonly Business[] = [
  {
    id: '1', name: 'The Breakfast Klub', slug: 'the-breakfast-klub', category: 'restaurant',
    subtype: ['Breakfast', 'Soul Food'], priceTier: 2, address: '3711 Travis St, Houston, TX 77002',
    latitude: 29.7384707, longitude: -95.3804262, phone: '+1 713-528-8561',
    verificationStatus: 'verified', welcomeBadge: true, buzzing: true, distanceMiles: 0.9,
  },
  {
    id: '2', name: "Lucille's", slug: 'lucilles', category: 'restaurant',
    subtype: ['Southern', 'Seafood', 'Brunch'], priceTier: 2, address: '5512 La Branch St, Houston, TX 77004',
    latitude: 29.7238227, longitude: -95.3850641, phone: '+1 713-568-2505',
    verificationStatus: 'verified', welcomeBadge: true, buzzing: false, distanceMiles: 1.4,
  },
  {
    id: '3', name: "Mikki's Soul Food Cafe", slug: 'mikkis-soul-food-cafe', category: 'restaurant',
    subtype: ['Soul Food', 'Seafood'], priceTier: 2, address: '2712 Blodgett St, Houston, TX 77004',
    latitude: 29.7230128, longitude: -95.3697263, phone: '+1 713-485-4850',
    verificationStatus: 'community', welcomeBadge: false, buzzing: false, distanceMiles: 1.6,
  },
  {
    id: '4', name: 'Lost & Found', slug: 'lost-and-found', category: 'restaurant',
    subtype: ['Bar & Grill', 'Brunch'], priceTier: 2, address: '160 W Gray St, Houston, TX 77019',
    latitude: 29.7534725, longitude: -95.3809497, phone: '+1 832-649-3050',
    verificationStatus: 'community', welcomeBadge: true, buzzing: false, distanceMiles: 2.1,
  },
];
