import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltresSeancesComponent } from './filtres-seances.component';

describe('FiltresSeancesComponent', () => {
  let component: FiltresSeancesComponent;
  let fixture: ComponentFixture<FiltresSeancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltresSeancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FiltresSeancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
