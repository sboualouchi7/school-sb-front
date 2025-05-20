import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeancesEnseignantComponent } from './seances-enseignant.component';

describe('SeancesEnseignantComponent', () => {
  let component: SeancesEnseignantComponent;
  let fixture: ComponentFixture<SeancesEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeancesEnseignantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeancesEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
