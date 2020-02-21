import { TestBed } from '@angular/core/testing';

import { TimeAPIClientService } from './time-apiclient.service';

describe('TimeAPIClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeAPIClientService = TestBed.get(TimeAPIClientService);
    expect(service).toBeTruthy();
  });
});
