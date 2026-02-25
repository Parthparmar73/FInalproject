import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Manufacturing } from './manufacturing';

describe('Manufacturing', () => {
  let component: Manufacturing;
  let fixture: ComponentFixture<Manufacturing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Manufacturing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Manufacturing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
