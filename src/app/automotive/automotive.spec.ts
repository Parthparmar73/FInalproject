import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Automotive } from './automotive';

describe('Automotive', () => {
  let component: Automotive;
  let fixture: ComponentFixture<Automotive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Automotive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Automotive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
