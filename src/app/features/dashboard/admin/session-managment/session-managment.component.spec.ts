import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionManagmentComponent } from './session-managment.component';

describe('SessionManagmentComponent', () => {
  let component: SessionManagmentComponent;
  let fixture: ComponentFixture<SessionManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionManagmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SessionManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
