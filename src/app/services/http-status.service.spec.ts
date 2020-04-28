import { TestBed } from '@angular/core/testing';

import { HttpStatusService } from './http-status.service';

describe('HttpStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpStatusService = TestBed.get(HttpStatusService);
    expect(service).toBeTruthy();
  });
});
