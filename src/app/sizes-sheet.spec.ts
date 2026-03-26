import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SizesSheet } from './sizes-sheet';

describe('SizesSheet', () => {
  let component: SizesSheet;
  let fixture: ComponentFixture<SizesSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizesSheet, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SizesSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
