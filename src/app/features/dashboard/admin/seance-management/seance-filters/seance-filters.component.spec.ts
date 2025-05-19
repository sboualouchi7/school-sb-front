import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeanceFiltersComponent } from './seance-filters.component';

describe('SeanceFiltersComponent', () => {
  let component: SeanceFiltersComponent;
  let fixture: ComponentFixture<SeanceFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeanceFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeanceFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
