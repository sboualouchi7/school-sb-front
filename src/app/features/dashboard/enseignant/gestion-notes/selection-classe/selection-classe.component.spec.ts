import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionClasseComponent } from './selection-classe.component';

describe('SelectionClasseComponent', () => {
  let component: SelectionClasseComponent;
  let fixture: ComponentFixture<SelectionClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionClasseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectionClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
