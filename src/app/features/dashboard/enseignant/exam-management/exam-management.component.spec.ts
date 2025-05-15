import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamManagementComponent } from './exam-management.component';

describe('DashAdminExamsHomeComponent', () => {
  let component: ExamManagementComponent;
  let fixture: ComponentFixture<ExamManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamManagementComponent]
    });
    fixture = TestBed.createComponent(ExamManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
