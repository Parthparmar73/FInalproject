const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '../src/app');

const pages = [
  { folder: 'ecommerce',             class: 'Ecommerce',            pkg: "E-commerce Blueprint",        defaultPrice: "₹3,500" },
  { folder: 'design-to-html',        class: 'DesignToHtml',         pkg: "Design to HTML",              defaultPrice: "₹1,500" },
  { folder: 'digitaltransformation', class: 'Digitaltransformation',pkg: "Digital Transformation",      defaultPrice: "₹5,000" },
  { folder: 'security',              class: 'Security',             pkg: "Security Blueprint",          defaultPrice: "₹4,000" },
  { folder: 'performance',           class: 'Performance',          pkg: "Performance Optimization",    defaultPrice: "₹2,000" },
  { folder: 'manufacturing',         class: 'Manufacturing',        pkg: "Manufacturing Solutions",     defaultPrice: "₹8,000" },
  { folder: 'automotive',            class: 'Automotive',           pkg: "Automotive Blueprint",        defaultPrice: "₹7,500" },
  { folder: 'retail-ecom',           class: 'RetailEcom',           pkg: "Retail & E-commerce",         defaultPrice: "₹6,000" },
];

pages.forEach(({ folder, class: className, pkg, defaultPrice }) => {
  const htmlFile = folder + '.html';
  const tsFile   = folder + '.ts';

  const htmlFilePath = path.join(appDir, folder, htmlFile);
  const tsFilePath = path.join(appDir, folder, tsFile);

  if (!fs.existsSync(htmlFilePath) || !fs.existsSync(tsFilePath)) {
    console.log(`⚠️  Skipping ${folder} — file not found`);
    return;
  }

  // ── Patch TS ──────────────────────────────────────────────────────────────
  let ts = fs.readFileSync(tsFilePath, 'utf8');

  // Add properties and constructor injection if not present
  if (!ts.includes('pkgPrice =')) {
    ts = ts.replace(
      'showQuote = false;',
      `showQuote = false;
  
  // Dynamic pricing
  pkgPrice = '${defaultPrice}'; // Default fallback
  pkgDuration = 'One-time';`
    );
  }

  // Edit the constructor to read router state.
  if (ts.includes('constructor(')) {
    // It might be constructor(private auth: Auth, private router: Router) { }
    if (ts.indexOf('this.router.getCurrentNavigation') === -1) {
      ts = ts.replace(
        /constructor\s*\(([^)]*)\)\s*\{([^}]*)\}/,
        (match, args, body) => {
          return `constructor(${args}) {${body}
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state?.['pkg'] || window?.history?.state?.['pkg'];
    if (state) {
      const parsed = typeof state === 'string' ? JSON.parse(state) : state;
      if (parsed.price) {
         this.pkgPrice = \`₹\${parsed.price.toLocaleString('en-IN')}\`;
      }
      if (parsed.duration) {
         this.pkgDuration = parsed.duration;
      }
    }
  }`;
        }
      );
    }
  }

  fs.writeFileSync(tsFilePath, ts, 'utf8');
  console.log(`✅ TS patched:   ${tsFile}`);

  // ── Patch HTML ────────────────────────────────────────────────────────────
  let html = fs.readFileSync(htmlFilePath, 'utf8');

  // Replace fixed price <strong>₹X,XXX</strong> with <strong>{{ pkgPrice }}</strong>
  // The default fixed price is usually inside <small>Fixed Price</small> <strong>₹X,XXX</strong>
  html = html.replace(
    /<strong>(₹[0-9,]+)<\/strong>/,
    `<strong>{{ pkgPrice }}</strong>`
  );

  // Replace duration <strong>One-time</strong> with <strong>{{ pkgDuration }}</strong>
  // Usually <small>Duration</small> <strong>One-time</strong>
  html = html.replace(
    /<strong>One-time<\/strong>/,
    `<strong>{{ pkgDuration }}</strong>`
  );
  
  // Also pass pkgPrice to payment modal instead of hardcoded '₹X,XXX'
  html = html.replace(
    /\[price\]="'₹[0-9,]+'"/,
    `[price]="pkgPrice"`
  );

  fs.writeFileSync(htmlFilePath, html, 'utf8');
  console.log(`✅ HTML patched: ${htmlFile}`);

});

console.log('\n🎉 All service pages dynamic prices patched!');
