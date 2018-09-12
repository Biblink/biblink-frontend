import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';

import { StudyDataService } from './study-data.service';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';

describe('StudyDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule,
        HttpClientTestingModule
      ],
      providers: [ StudyDataService ]
    });
  });

  it('should be created', inject(
    [ StudyDataService ],
    (service: StudyDataService) => {
      expect(service).toBeTruthy();
    }
  ));
});
