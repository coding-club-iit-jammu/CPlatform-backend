import { TestBed } from '@angular/core/testing';

import { StoreInfoService } from './store-info.service';

describe('StoreInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreInfoService = TestBed.get(StoreInfoService);
    expect(service).toBeTruthy();
  });
});
