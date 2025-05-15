import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionLoginComponent } from './section-login.component';

describe('SectionLoginComponent', () => {
  let component: SectionLoginComponent;
  let fixture: ComponentFixture<SectionLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SectionLoginComponent]
    });
    fixture = TestBed.createComponent(SectionLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
