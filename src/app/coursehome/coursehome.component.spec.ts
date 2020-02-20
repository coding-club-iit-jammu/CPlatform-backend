import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursehomeComponent } from './coursehome.component';

describe('CoursehomeComponent', () => {
  let component: CoursehomeComponent;
  let fixture: ComponentFixture<CoursehomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursehomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursehomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
