import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorhomeComponent } from './instructorhome.component';

describe('InstructorhomeComponent', () => {
  let component: InstructorhomeComponent;
  let fixture: ComponentFixture<InstructorhomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstructorhomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructorhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
