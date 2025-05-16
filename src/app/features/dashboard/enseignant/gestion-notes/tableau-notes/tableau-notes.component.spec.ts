import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauNotesComponent } from './tableau-notes.component';

describe('TableauNotesComponent', () => {
  let component: TableauNotesComponent;
  let fixture: ComponentFixture<TableauNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauNotesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TableauNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
