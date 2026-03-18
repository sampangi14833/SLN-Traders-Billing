import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SizesSheet } from './sizes-sheet';

describe('SizesSheet', () => {
  let component: SizesSheet;
  let fixture: ComponentFixture<SizesSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizesSheet]
    }).compileComponents();

    fixture = TestBed.createComponent(SizesSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
