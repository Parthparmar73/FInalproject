/**
 * patchServicePages.js
 * Run once: node patchServicePages.js
 * Adds showQuote + CustomQuoteComponent to all remaining service pages
 */

const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '../src/app');

const pages = [
  { folder: 'design-to-html',       class: 'DesignToHtml',        pkg: "Design to HTML" },
  { folder: 'digitaltransformation', class: 'Digitaltransformation', pkg: "Digital Transformation" },
  { folder: 'security',              class: 'Security',             pkg: "Security Blueprint" },
  { folder: 'performance',           class: 'Performance',          pkg: "Performance Optimization" },
  { folder: 'manufacturing',         class: 'Manufacturing',        pkg: "Manufacturing Solutions" },
  { folder: 'automotive',            class: 'Automotive',           pkg: "Automotive Blueprint" },
  { folder: 'retail-ecom',           class: 'RetailEcom',           pkg: "Retail & E-commerce" },
];

pages.forEach(({ folder, pkg }) => {
  const htmlPath = path.join(appDir, folder, folder.replace('retail-ecom','retail-ecom') + '.html');
  
  // Find the actual html file
  const files = fs.readdirSync(path.join(appDir, folder));
  const htmlFile = files.find(f => f.endsWith('.html'));
  const tsFile   = files.find(f => f.endsWith('.ts') && !f.includes('spec'));

  if (!htmlFile || !tsFile) {
    console.log(`⚠️  Skipping ${folder} — file not found`);
    return;
  }

  // ── Patch HTML ────────────────────────────────────────────────────────────
  const htmlFilePath = path.join(appDir, folder, htmlFile);
  let html = fs.readFileSync(htmlFilePath, 'utf8');

  // 1. Add click to Custom Quote button (if not already done)
  html = html.replace(
    `<button class="secondary">Custom Quote</button>`,
    `<button class="secondary" (click)="showQuote = true">Custom Quote</button>`
  );

  // 2. Append Custom Quote modal before last </app-payment-modal> fallback
  if (!html.includes('app-custom-quote')) {
    html = html.replace(
      '</app-payment-modal>',
      `</app-payment-modal>\n\n<!-- Custom Quote Modal -->\n<app-custom-quote\n  *ngIf="showQuote"\n  [packageName]="'${pkg}'"\n  (closed)="showQuote = false">\n</app-custom-quote>`
    );
  }

  fs.writeFileSync(htmlFilePath, html, 'utf8');
  console.log(`✅ HTML patched: ${htmlFile}`);

  // ── Patch TS ──────────────────────────────────────────────────────────────
  const tsFilePath = path.join(appDir, folder, tsFile);
  let ts = fs.readFileSync(tsFilePath, 'utf8');

  // 1. Add import if missing
  if (!ts.includes('CustomQuoteComponent')) {
    ts = ts.replace(
      `import { PaymentModalComponent } from '../payment-modal/payment-modal';`,
      `import { PaymentModalComponent } from '../payment-modal/payment-modal';\nimport { CustomQuoteComponent } from '../custom-quote/custom-quote';`
    );
  }

  // 2. Add to imports array
  if (!ts.includes('CustomQuoteComponent')) {
    ts = ts.replace('PaymentModalComponent]', 'PaymentModalComponent, CustomQuoteComponent]');
  } else {
    ts = ts.replace('PaymentModalComponent]', 'PaymentModalComponent, CustomQuoteComponent]');
  }

  // 3. Add showQuote = false
  if (!ts.includes('showQuote')) {
    ts = ts.replace('showPayment = false;', 'showPayment = false;\n  showQuote = false;');
  }

  fs.writeFileSync(tsFilePath, ts, 'utf8');
  console.log(`✅ TS patched:   ${tsFile}`);
});

console.log('\n🎉 All service pages patched!');
