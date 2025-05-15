import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceManagementComponent } from './absence-management.component';

describe('DashAdminAbsenceHomeComponent', () => {
  let component: AbsenceManagementComponent;
  let fixture: ComponentFixture<AbsenceManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbsenceManagementComponent]
    });
    fixture = TestBed.createComponent(AbsenceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
