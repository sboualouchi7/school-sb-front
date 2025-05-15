import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamAssignToTeacherComponent } from './exam-assign-to-teacher.component';

describe('DashAdminAddExamsToProfComponent', () => {
  let component: ExamAssignToTeacherComponent;
  let fixture: ComponentFixture<ExamAssignToTeacherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamAssignToTeacherComponent]
    });
    fixture = TestBed.createComponent(ExamAssignToTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
