import { TestBed } from '@angular/core/testing';

import { CarTableDataService } from './car-table-data.service';

describe('CarTableDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CarTableDataService = TestBed.get(CarTableDataService);
    expect(service).toBeTruthy();
  });
});
