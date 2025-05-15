import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeHomeComponent } from './mode-home.component';

describe('ModeHomeComponent', () => {
  let component: ModeHomeComponent;
  let fixture: ComponentFixture<ModeHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModeHomeComponent]
    });
    fixture = TestBed.createComponent(ModeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
