import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeSeancesComponent } from './liste-seances.component';

describe('ListeSeancesComponent', () => {
  let component: ListeSeancesComponent;
  let fixture: ComponentFixture<ListeSeancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeSeancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListeSeancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
