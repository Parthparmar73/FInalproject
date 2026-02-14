import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailEcom } from './retail-ecom';

describe('RetailEcom', () => {
  let component: RetailEcom;
  let fixture: ComponentFixture<RetailEcom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailEcom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetailEcom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
