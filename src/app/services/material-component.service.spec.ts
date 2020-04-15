import { TestBed } from '@angular/core/testing';

import { MaterialComponentService } from './material-component.service';

describe('MaterialComponentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MaterialComponentService = TestBed.get(MaterialComponentService);
    expect(service).toBeTruthy();
  });
});
