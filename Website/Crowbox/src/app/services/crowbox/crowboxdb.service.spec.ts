import { TestBed } from '@angular/core/testing';

import { CrowboxdbService } from './crowboxdb.service';

describe('CrowboxdbService', () => {
  let service: CrowboxdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrowboxdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
