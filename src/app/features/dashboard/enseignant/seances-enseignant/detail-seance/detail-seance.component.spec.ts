import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSeanceComponent } from './detail-seance.component';

describe('DetailSeanceComponent', () => {
  let component: DetailSeanceComponent;
  let fixture: ComponentFixture<DetailSeanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSeanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailSeanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
