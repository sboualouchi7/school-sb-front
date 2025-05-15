import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentManagmentComponent } from './parent-managment.component';

describe('ParentManagmentComponent', () => {
  let component: ParentManagmentComponent;
  let fixture: ComponentFixture<ParentManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentManagmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParentManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
