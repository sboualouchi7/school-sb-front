import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeanceManagementComponent } from './seance-management.component';

describe('SeanceManagementComponent', () => {
  let component: SeanceManagementComponent;
  let fixture: ComponentFixture<SeanceManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeanceManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeanceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
