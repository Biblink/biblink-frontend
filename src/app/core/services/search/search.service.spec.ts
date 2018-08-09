import { TestBed, inject } from '@angular/core/testing';

import { SearchService } from './search.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService]
    });
  });

  it('should be created', inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});
