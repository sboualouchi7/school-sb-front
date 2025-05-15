import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceCreateComponent } from './absence-create.component';

describe('DashAdminInsertAbsenceComponent', () => {
  let component: AbsenceCreateComponent;
  let fixture: ComponentFixture<AbsenceCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbsenceCreateComponent]
    });
    fixture = TestBed.createComponent(AbsenceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
