import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceListComponent } from './absence-list.component';

describe('DashAdminGetAbsencesComponent', () => {
  let component: AbsenceListComponent;
  let fixture: ComponentFixture<AbsenceListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbsenceListComponent]
    });
    fixture = TestBed.createComponent(AbsenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
