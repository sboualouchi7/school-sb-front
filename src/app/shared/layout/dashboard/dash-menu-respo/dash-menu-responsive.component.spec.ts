import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashMenuRespoComponent } from './dash-menu-responsive.component';

describe('DashMenuRespoComponent', () => {
  let component: DashMenuRespoComponent;
  let fixture: ComponentFixture<DashMenuRespoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashMenuRespoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashMenuRespoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
