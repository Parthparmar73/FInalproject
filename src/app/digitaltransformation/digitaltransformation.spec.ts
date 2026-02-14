import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Digitaltransformation } from './digitaltransformation';

describe('Digitaltransformation', () => {
  let component: Digitaltransformation;
  let fixture: ComponentFixture<Digitaltransformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Digitaltransformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Digitaltransformation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
