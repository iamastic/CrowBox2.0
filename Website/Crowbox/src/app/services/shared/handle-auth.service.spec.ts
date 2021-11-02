import { TestBed } from '@angular/core/testing';

import { HandleAuthService } from './handle-auth.service';

describe('HandleAuthService', () => {
  let service: HandleAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
