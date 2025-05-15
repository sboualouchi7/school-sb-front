import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherManagementComponent } from './teacher-management.component';

describe('DashAdminGestionProfHomeComponent', () => {
  let component: TeacherManagementComponent;
  let fixture: ComponentFixture<TeacherManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherManagementComponent]
    });
    fixture = TestBed.createComponent(TeacherManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
