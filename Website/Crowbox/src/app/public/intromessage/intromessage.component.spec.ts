import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntromessageComponent } from './intromessage.component';

describe('IntromessageComponent', () => {
  let component: IntromessageComponent;
  let fixture: ComponentFixture<IntromessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntromessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntromessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
