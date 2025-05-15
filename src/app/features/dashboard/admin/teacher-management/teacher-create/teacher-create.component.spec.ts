import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCreateComponent } from './teacher-create.component';

describe('DashAdminAddProfComponent', () => {
  let component: TeacherCreateComponent;
  let fixture: ComponentFixture<TeacherCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherCreateComponent]
    });
    fixture = TestBed.createComponent(TeacherCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
