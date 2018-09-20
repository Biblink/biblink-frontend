import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentSnapshot,
  Action
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { UserDataInterface } from '../../interfaces/user-data.interface';
import { User } from '../../interfaces/user';
import { Utils } from '../../../utilities/utils';
import { map, takeUntil, startWith, tap } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';
/**
 * User data service to handle getting all user-related data
 */
@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  /**
   * BehaviorSubject to hold current user data
   */
  userData: BehaviorSubject<User> = new BehaviorSubject(null);
  /**
   * BehaviorSuject to hold current user ID
   */
  userID: BehaviorSubject<string> = new BehaviorSubject('');
  /**
   * Local user data from local storage
   */
  localUserData: any;
  /**
   * User reference document
   */
  userReference: AngularFirestoreDocument<any> = null;
  /**
   * Initializes dependencies and does dependency injection
   * @param _auth Auth service to verify authentication
   * @param afs AngularFirestore to access firestore backend
   */
  constructor(private _auth: AuthService, public afs: AngularFirestore) {
    let dataRef: Observable<Action<DocumentSnapshot<any>>> = null;
    let dataSubscription: Subscription = null;
    this._auth.authState.subscribe(res => {
      if (res === null || res === undefined) {
        if (dataSubscription !== null) {
          dataSubscription.unsubscribe();
          localStorage.removeItem('user');
        }
        if (dataRef !== null) {
          dataRef = null;
        }
        this.userReference = null;
        this.userData.next(
          new User('', '', '', {
            profileImage: '',
            bio: '',
            shortDescription: ''
          })
        );
        this.userID.next('');
      } else {
        let receivedLocalData = false;
        if (res.emailVerified) {
          this.userReference = this.afs.doc(`/users/${ res.uid }`);
          this.userID.next(res.uid);
          dataRef = this.userReference.snapshotChanges();
          dataSubscription = dataRef
            .pipe(
              map(response =>
                Object.assign({
                  uid: res.uid,
                  exists: response.payload.exists,
                  data: response.payload.data()
                })
              ),
              tap(user => localStorage.setItem('user', JSON.stringify(user))),
              startWith(JSON.parse(localStorage.getItem('user')))
            )
            .subscribe(
              response => {
                if (!receivedLocalData) {
                  // get existing local storage
                  console.log('Received Local Data: ', response);
                  this.localUserData = response;
                  receivedLocalData = true;
                  if (
                    this.localUserData !== null &&
                    this.localUserData.data === undefined
                  ) {
                    this.localUserData.firstName = '';
                  }
                }
                if (response !== null) {
                  if (response.exists === false && response.uid === res.uid) {
                    if (this.localUserData === null || this.localUserData.firstName === '') {
                      const data = new User('', '', res.email, {
                        profileImage: res.photoURL,
                        bio: '',
                        shortDescription: ''
                      });
                      this.userReference.set(Utils.toJson(data));
                      console.log('added to firebase collection');
                    }
                  } else {
                    if (response.data === undefined) {
                      this.logout();
                    } else {
                      const data = response.data as User;
                      if (data.email !== res.email) {
                        data.email = res.email;
                        this.userReference.update(data);
                      }
                      this.userData.next(data);
                    }
                  }
                }
              },
              error => {
                console.log('There was an error: ' + error);
              }
            );
        } else {
          this.userData.next(
            new User('', '', '', {
              profileImage: '',
              bio: '',
              shortDescription: ''
            })
          );
          this.userID.next('');
        }
      }
    });
  }
  /**
   * Updates user profile data
   * @param {Object} data User data
   */
  public updateProfile(data: Object) {
    if (data instanceof User) {
      return this.userReference.update(Utils.toJson(data));
    }
    return this.userReference.update(data);
  }
  /**
   * Add study to a user's study collection in database
   * @param {string} studyID Study ID
   * @param {'member' | 'admin' | 'leader'} role Role of user
   */
  public addStudy(studyID: string, role: 'member' | 'admin' | 'leader') {
    return this.userReference
      .collection('studies')
      .doc(studyID)
      .set({ id: studyID, role: role });
  }
  /**
   * Gets user's notifications from database collection
   */
  public getNotifications() {
    const uid = this.userID.getValue();
    if (uid === '') {
      return of([]);
    }
    return this.afs
      .doc(`users/${ uid }`)
      .collection('notifications')
      .snapshotChanges()
      .pipe(
        map(val => {
          const converted = [];
          val.forEach((res, index) => {
            const data = res.payload.doc.data();
            data[ 'id' ] = res.payload.doc.id;
            converted.push(data);
          });
          return converted;
        })
      );
  }
  /**
   * Clears all notifications given by the notificationIDs
   * @param {string[]} notificationIDs Notification IDs to clear
   * @returns {Promise} Delete actions of all notifications
   */
  public clearNotifications(notificationIDs: string[]) {
    const uid = this.userID.getValue();
    if (uid === '') {
      return;
    }
    const notificationsRef = this.afs
      .doc(`users/${ uid }`)
      .collection('notifications');
    const promises = [];
    notificationIDs.forEach(id => {
      promises.push(notificationsRef.doc(id).delete());
    });
    return Promise.all(promises);
  }
  /**
   * Marks a notification as read given a notification ID
   * @param notificationID Notification ID to mark as read
   */
  public markNotificationAsRead(notificationID: string) {
    const uid = this.userID.getValue();
    if (uid === '') {
      return;
    }
    return this.afs
      .doc(`users/${ uid }`)
      .collection('notifications')
      .doc(notificationID)
      .update({ read: true });
  }
  /**
   * Gets study data based on group ID
   * @param groupID Group ID
   */
  public getStudyData(groupID: string) {
    return this.afs.doc(`/studies/${ groupID }`).valueChanges();
  }

  /**
   * Logs user out and removes 'user' item from local storage
   */
  public logout() {
    return this._auth.logout().then(() => {
      localStorage.removeItem('user');
    });
  }
  /**
   * Gets user data
   */
  public get user() {
    return this.userData;
  }
  /**
   * Gets user data from a user ID
   * @param uid User ID
   */
  getDataFromID(uid) {
    return this.afs
      .collection('users')
      .doc(uid)
      .valueChanges();
  }
}
