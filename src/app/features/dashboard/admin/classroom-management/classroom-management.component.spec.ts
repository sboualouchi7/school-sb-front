import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomManagementComponent } from './classroom-management.component';

describe('DashAdminClassRoomHomeComponent', () => {
  let component: ClassroomManagementComponent;
  let fixture: ComponentFixture<ClassroomManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClassroomManagementComponent]
    });
    fixture = TestBed.createComponent(ClassroomManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
