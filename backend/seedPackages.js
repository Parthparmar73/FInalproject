/**
 * seedPackages.js
 * ─────────────────────────────────────────────────────────────────
 * Navbar ke hard-coded packages ko Firestore mein seed karta hai.
 * Ek baar run karo:  node seedPackages.js
 * ─────────────────────────────────────────────────────────────────
 */

const { db } = require('./firebaseAdmin');

const packages = [
  {
    name: 'E-commerce Solution',
    price: 3500,
    duration: 'One-time',
    popular: true,
    features: [
      'Payment Gateway Integration',
      'Admin Dashboard',
      'Mobile Responsive',
      'Product Management',
      'Custom Checkout',
      'Inventory Management',
      'Multi-currency Support',
    ],
    badge: 'BEST SELLER',
    badgeColor: 'orange',
    route: '/ecommerce',
    icon: '🛒',
    order: 0,
  },
  {
    name: 'Design to HTML',
    price: 1500,
    duration: 'One-time',
    popular: false,
    features: [
      'Figma / XD to HTML',
      'Pixel-perfect output',
      'Cross-browser compatible',
      'SEO-ready structure',
    ],
    badge: 'PIXEL PERFECT',
    badgeColor: 'green',
    route: '/design-to-html',
    icon: '🎨',
    order: 1,
  },
  {
    name: 'Digital Transformation',
    price: 5000,
    duration: 'One-time',
    popular: false,
    features: [
      'Cloud Migration',
      'Process Automation',
      'Legacy System Upgrade',
      'Analytics Integration',
    ],
    badge: 'ENTERPRISE',
    badgeColor: 'blue',
    route: '/digitaltransformation',
    icon: '🚀',
    order: 2,
  },
  {
    name: 'Security Blueprint',
    price: 4000,
    duration: 'One-time',
    popular: false,
    features: [
      'Vulnerability Scanning',
      'SSL Setup',
      'SOC2 Aligned Audit',
      'Threat Detection',
    ],
    badge: 'CRITICAL',
    badgeColor: 'red',
    route: '/security',
    icon: '🛡️',
    order: 3,
  },
  {
    name: 'Performance Optimization',
    price: 2000,
    duration: 'One-time',
    popular: false,
    features: [
      'Core Web Vitals Fix',
      'CDN Integration',
      'Image Optimization',
      'Caching Strategy',
    ],
    badge: 'SPEED',
    badgeColor: 'purple',
    route: '/performance',
    icon: '⚡',
    order: 4,
  },
  {
    name: 'Manufacturing Solutions',
    price: 8000,
    duration: 'One-time',
    popular: false,
    features: [
      'ERP Integration',
      'Inventory Management',
      'Production Tracking',
      'IoT Ready',
    ],
    badge: 'INDUSTRY',
    badgeColor: 'teal',
    route: '/manufacturing',
    icon: '🏭',
    order: 5,
  },
  {
    name: 'Automotive Blueprint',
    price: 7500,
    duration: 'One-time',
    popular: false,
    features: [
      'Dealer Portal',
      'Service Booking',
      'Fleet Management',
      'Real-time Tracking',
    ],
    badge: 'PREMIUM',
    badgeColor: 'gold',
    route: '/automotive',
    icon: '🚗',
    order: 6,
  },
  {
    name: 'Retail & E-commerce',
    price: 6000,
    duration: 'One-time',
    popular: false,
    features: [
      'Omnichannel Platform',
      'POS Integration',
      'Loyalty Programs',
      'Analytics Dashboard',
    ],
    badge: 'RETAIL',
    badgeColor: 'orange',
    route: '/retail-ecommerce',
    icon: '🏪',
    order: 7,
  },
];

// ──────────────────────────────────────────────────────────────────
// Nav Items seed data (Services, Challenges, Industries)
// ──────────────────────────────────────────────────────────────────

const navServices = [
  { label: 'E-commerce Development', route: '/ecommerce',        icon: '🛒', description: 'End-to-end e-commerce solutions',    order: 0 },
  { label: 'Design to HTML',         route: '/design-to-html',   icon: '🎨', description: 'Figma/XD to pixel-perfect code',     order: 1 },
];

const navChallenges = [
  { label: 'Digital Transformation', route: '/digitaltransformation', icon: '🚀', description: 'Cloud, automation & legacy upgrade', order: 0 },
  { label: 'Security',               route: '/security',              icon: '🛡️', description: 'Audits, SSL & threat detection',    order: 1 },
  { label: 'Performance',            route: '/performance',           icon: '⚡', description: 'Core Web Vitals & CDN boost',       order: 2 },
];

const navIndustries = [
  { label: 'Manufacturing',    route: '/manufacturing',    icon: '🏭', description: 'ERP, inventory & production',     order: 0 },
  { label: 'Automotive',       route: '/automotive',       icon: '🚗', description: 'Dealer portal & fleet systems',   order: 1 },
  { label: 'Retail & E-comm',  route: '/retail-ecommerce', icon: '🏪', description: 'Omnichannel retail platform',     order: 2 },
];

// ──────────────────────────────────────────────────────────────────
// Seed helper
// ──────────────────────────────────────────────────────────────────

async function seedCollection(collectionName, items) {
  console.log(`\n📦 Seeding '${collectionName}' (${items.length} items)...`);

  // Check if already seeded
  const existing = await db.collection(collectionName).get();
  if (!existing.empty) {
    console.log(`  ⚠️  '${collectionName}' already has ${existing.size} docs — skipping.`);
    console.log(`     Delete them manually if you want to re-seed.`);
    return;
  }

  const batch = db.batch();
  items.forEach(item => {
    const ref = db.collection(collectionName).doc();
    batch.set(ref, { ...item, createdAt: new Date() });
  });
  await batch.commit();
  console.log(`  ✅ ${items.length} items added to '${collectionName}'`);
}

async function main() {
  console.log('🚀 Pixelroot — Package & Nav Seeder');
  console.log('════════════════════════════════════');

  await seedCollection('packages',       packages);
  await seedCollection('nav-services',   navServices);
  await seedCollection('nav-challenges', navChallenges);
  await seedCollection('nav-industries', navIndustries);

  console.log('\n✅ Seeding complete! Admin dashboard refresh karo.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
