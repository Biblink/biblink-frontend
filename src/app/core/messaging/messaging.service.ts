import { Injectable, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from '../interfaces/user';
import { FirebaseApp } from '@angular/fire';
/**
 * Messaging service to handle all push notifications and FCM
 */
@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  /**
   * Firebase messaging instance
   */
  private messaging: firebase.messaging.Messaging;
  /**
   * Firebase messaging source (i.e current message as a subject)
   */
  private messageSource = new Subject();
  /**
   * (messageSource){@link messageSource} as an observable to subscribe to
   */
  currentMessage = this.messageSource.asObservable();
  /**
   * Initializes dependencies and does dependency injection
   * @param {AngularFirestore} afs AngularFirestore dependency to access firestore
   * @param {firebase.app.App} _firebaseApp Firebase app dependency to enable messaging capability
   */
  constructor(
    private afs: AngularFirestore,
    @Inject(FirebaseApp) private _firebaseApp: firebase.app.App
  ) { }
  /**
   * Gets permission from user for notifications.
   * If granted, gets token and saves it to the database
   * @param user User Object
   * @param userID User ID
   */
  getPermission(user: User, userID: string) {
    this.messaging = firebase.messaging(this._firebaseApp);
    this.messaging.requestPermission()
      .then(() => {
        console.log('notification permission granted');
        return this.messaging.getToken();
      })
      .then(token => this.saveToken(user, userID, token))
      .catch(err => console.error(err, 'Unable to get permission'));
  }
  /**
   * Listens to refreshes in fcm token and updates database accordingly
   * @param user User data object
   * @param userID User ID
   */
  monitorRefresh(user: User, userID: string) {
    this.messaging.onTokenRefresh(() => {
      this.messaging.getToken()
        .then(refreshedToken => this.saveToken(user, userID, refreshedToken))
        .catch(err => console.error(err, 'Unable to retrieve new token'));
    });
  }
  /**
   * Shows messages when app is open
   */
  receiveMessages() {
    this.messaging.onMessage(payload => {
      this.messageSource.next(payload);
    });
  }
  /**
   * Saves FCM token to database
   * @param {User} user User data object
   * @param {string} userID User firebase ID (equals their auth ID)
   * @param {string} token FCM token to save
   */
  private saveToken(user: User, userID: string, token: string): void {
    const currentTokens = user.fcmTokens || {};
    if (!currentTokens[ token ]) {
      const userRef = this.afs.collection('users').doc(userID);
      const tokens = { ...currentTokens, [ token ]: true };
      userRef.update({ fcmTokens: tokens });
    }
  }

}
