import { TestBed, inject } from '@angular/core/testing';

import { StudyDataService } from './study-data.service';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

describe('StudyDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFireAuthModule,
        AngularFirestoreModule
      ],
      providers: [StudyDataService]
    });
  });

  it('should be created', inject(
    [StudyDataService],
    (service: StudyDataService) => {
      expect(service).toBeTruthy();
    }
  ));
});
