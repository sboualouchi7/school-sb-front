import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetNotesRecentesComponent } from './widget-notes-recentes.component';

describe('WidgetNotesRecentesComponent', () => {
  let component: WidgetNotesRecentesComponent;
  let fixture: ComponentFixture<WidgetNotesRecentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetNotesRecentesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetNotesRecentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
