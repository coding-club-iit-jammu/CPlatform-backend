import { TestBed } from '@angular/core/testing';

import { FirebaseServicesService } from './firebase-services.service';

describe('FirebaseServicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirebaseServicesService = TestBed.get(FirebaseServicesService);
    expect(service).toBeTruthy();
  });
});
