import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUpdateComponent } from './test-update.component';

describe('TestUpdateComponent', () => {
  let component: TestUpdateComponent;
  let fixture: ComponentFixture<TestUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
