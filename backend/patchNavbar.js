/**
 * patchNavbar.js - Replace hard-coded Services dropdown with dynamic *ngFor
 * Run: node patchNavbar.js
 */
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/app/navbar/navbar.html');
let html = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to \n for easy matching
html = html.replace(/\r\n/g, '\n');

// ── Find and replace the SERVICES <li> block ────────────────────────────────
const oldBlock = `        <!-- SERVICES -->
        <li class="services-wrapper" (mouseenter)="openDropdown('services')" (mouseleave)="closeDropdown()">

          <a class="nav-link">Services</a>

          <div class="mega-dropdown" [class.show]="activeDropdown === 'services'">

            <div class="dropdown-grid">

              <div>
                <h4>Services</h4>
                <a routerLink="/ecommerce" (click)="closeDropdown()">E-commerce Development</a>
                <a routerLink="/design-to-html" (click)="closeDropdown()">Design to HTML</a>
              </div>

              <div>
                <h4>Business Challenges</h4>
                <a routerLink="/digitaltransformation" (click)="closeDropdown()">
                  <div class="icon-box">Digital Transformation</div>
                </a>
                <a routerLink="/security" (click)="closeDropdown()">
                  <div class="icon-box">Security</div>
                </a>
                <a routerLink="/performance" (click)="closeDropdown()">
                  <div class="icon-box">Performance</div>
                </a>
              </div>

              <div>
                <h4>Industry Focus</h4>
                <a routerLink="/manufacturing" (click)="closeDropdown()">Manufacturing</a>
                <a routerLink="/automotive" (click)="closeDropdown()">Automotive</a>
                <a routerLink="/retail-ecommerce" (click)="closeDropdown()">Retail &amp; E-commerce</a>
              </div>

            </div>
          </div>
        </li>`;

const newBlock = `        <!-- SERVICES -->
        <li class="services-wrapper" (mouseenter)="openDropdown('services')" (mouseleave)="closeDropdown()">

          <a class="nav-link">Services</a>

          <div class="mega-dropdown" [class.show]="activeDropdown === 'services'">
            <div class="dropdown-grid">

              <!-- Services column (dynamic from Firestore nav-services) -->
              <div>
                <h4>Services</h4>
                <ng-container *ngIf="navServices.length > 0; else fallbackServices">
                  <a *ngFor="let item of navServices"
                     (click)="navigateTo(item.route)"
                     style="cursor:pointer">
                    {{ item.icon }} {{ item.label }}
                  </a>
                </ng-container>
                <ng-template #fallbackServices>
                  <a routerLink="/ecommerce"      (click)="closeDropdown()">E-commerce Development</a>
                  <a routerLink="/design-to-html" (click)="closeDropdown()">Design to HTML</a>
                </ng-template>
              </div>

              <!-- Business Challenges column (dynamic from Firestore nav-challenges) -->
              <div>
                <h4>Business Challenges</h4>
                <ng-container *ngIf="navChallenges.length > 0; else fallbackChallenges">
                  <a *ngFor="let item of navChallenges"
                     (click)="navigateTo(item.route)"
                     style="cursor:pointer">
                    <div class="icon-box">{{ item.icon }} {{ item.label }}</div>
                  </a>
                </ng-container>
                <ng-template #fallbackChallenges>
                  <a routerLink="/digitaltransformation" (click)="closeDropdown()">
                    <div class="icon-box">Digital Transformation</div>
                  </a>
                  <a routerLink="/security"    (click)="closeDropdown()"><div class="icon-box">Security</div></a>
                  <a routerLink="/performance" (click)="closeDropdown()"><div class="icon-box">Performance</div></a>
                </ng-template>
              </div>

              <!-- Industry Focus column (dynamic from Firestore nav-industries) -->
              <div>
                <h4>Industry Focus</h4>
                <ng-container *ngIf="navIndustries.length > 0; else fallbackIndustries">
                  <a *ngFor="let item of navIndustries"
                     (click)="navigateTo(item.route)"
                     style="cursor:pointer">
                    {{ item.icon }} {{ item.label }}
                  </a>
                </ng-container>
                <ng-template #fallbackIndustries>
                  <a routerLink="/manufacturing"    (click)="closeDropdown()">Manufacturing</a>
                  <a routerLink="/automotive"       (click)="closeDropdown()">Automotive</a>
                  <a routerLink="/retail-ecommerce" (click)="closeDropdown()">Retail &amp; E-commerce</a>
                </ng-template>
              </div>

            </div>
          </div>
        </li>`;

if (!html.includes(oldBlock.trim().slice(0, 80))) {
  // Try alternate match — maybe REPLACE_MARKER was set
  if (html.includes('REPLACE_MARKER')) {
    // find the closing </li> after REPLACE_MARKER
    const markerStart = html.indexOf('REPLACE_MARKER');
    const afterMarker = html.slice(markerStart);
    // find the closing </li>\n\n        <!-- COMPANIES -->
    const endPattern = '\n\n        <!-- COMPANIES -->';
    const endIdx = afterMarker.indexOf(endPattern);
    if (endIdx !== -1) {
      html = html.slice(0, markerStart) + newBlock + html.slice(markerStart + endIdx);
      console.log('✅ Patched via REPLACE_MARKER');
    } else {
      console.error('❌ Could not find end of SERVICES block after REPLACE_MARKER');
      process.exit(1);
    }
  } else {
    console.error('❌ Old block not found. File may already be patched or has changed.');
    process.exit(1);
  }
} else {
  html = html.replace(oldBlock, newBlock);
  console.log('✅ Patched SERVICES dropdown (direct match)');
}

// Write back with CRLF for Windows
fs.writeFileSync(filePath, html.replace(/\n/g, '\r\n'), 'utf8');
console.log('✅ navbar.html saved successfully!');
