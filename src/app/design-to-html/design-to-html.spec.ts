import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignToHtml } from './design-to-html';

describe('DesignToHtml', () => {
  let component: DesignToHtml;
  let fixture: ComponentFixture<DesignToHtml>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignToHtml]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignToHtml);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
