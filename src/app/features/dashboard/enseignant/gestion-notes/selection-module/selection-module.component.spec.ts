import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionModuleComponent } from './selection-module.component';

describe('SelectionModuleComponent', () => {
  let component: SelectionModuleComponent;
  let fixture: ComponentFixture<SelectionModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionModuleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectionModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
