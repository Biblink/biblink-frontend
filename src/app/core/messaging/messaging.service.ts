import { Injectable, Inject } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../interfaces/user';
import { FirebaseApp } from 'angularfire2';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private messaging: firebase.messaging.Messaging;
  private messageSource = new Subject();
  currentMessage = this.messageSource.asObservable();
  constructor(
    private afs: AngularFirestore,
    @Inject(FirebaseApp) private _firebaseApp: firebase.app.App
  ) { }

  getPermission(user: User, userID: string) {
    this.messaging = firebase.messaging(this._firebaseApp);
    this.messaging.requestPermission()
      .then(() => {
        return this.messaging.getToken();
      })
      .then(token => this.saveToken(user, userID, token))
      .catch(err => console.error(err, 'Unable to get permission'));
  }

  monitorRefresh(user: User, userID: string) {
    this.messaging.onTokenRefresh(() => {
      this.messaging.getToken()
        .then(refreshedToken => this.saveToken(user, userID, refreshedToken))
        .catch(err => console.error(err, 'Unable to retrieve new token'));
    });
  }
  // used to show messages when app is open
  receiveMessages() {
    this.messaging.onMessage(payload => {
      console.log(payload);
      this.messageSource.next(payload);
    });
  }

  private saveToken(user: User, userID: string, token): void {
    const currentTokens = user.fcmTokens || {};
    if (!currentTokens[ token ]) {
      const userRef = this.afs.collection('users').doc(userID);
      const tokens = { ...currentTokens, [ token ]: true };
      userRef.update({ fcmTokens: tokens });
    }
  }

}
