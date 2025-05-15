import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomListComponent } from './classroom-list.component';

describe('DashAdminGetClassRoomsComponent', () => {
  let component: ClassroomListComponent;
  let fixture: ComponentFixture<ClassroomListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClassroomListComponent]
    });
    fixture = TestBed.createComponent(ClassroomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
