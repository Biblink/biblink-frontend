import { TestBed, inject } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { environment } from '../../../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

describe('MessagingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebase, 'biblink'),
        AngularFirestoreModule
      ],
      providers: [ MessagingService ]
    });
  });

  it('should be created', inject(
    [ MessagingService ],
    (service: MessagingService) => {
      expect(service).toBeTruthy();
    }
  ));
});
