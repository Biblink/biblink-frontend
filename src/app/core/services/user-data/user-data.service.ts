import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot, Action } from 'angularfire2/firestore';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { UserDataInterface } from '../../interfaces/user-data.interface';
import { User } from '../../interfaces/user';
import { Utils } from '../../../utilities/utils';
import { map, takeUntil, startWith, tap } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  userData: BehaviorSubject<User> = new BehaviorSubject(null);
  userID: BehaviorSubject<string> = new BehaviorSubject('');
  localUserData: any;
  userReference: AngularFirestoreDocument<any> = null;

  constructor(private _auth: AuthService, public afs: AngularFirestore) {
    let dataRef: Observable<Action<DocumentSnapshot<any>>> = null;
    let dataSubscription: Subscription = null;
    this._auth.authState.subscribe((res) => {
      if (res === null || res === undefined) {
        if (dataSubscription !== null) {
          dataSubscription.unsubscribe();
          localStorage.removeItem('user');
        }
        if (dataRef !== null) {
          dataRef = null;
        }
        this.userReference = null;
        this.userData.next(new User('', '', '', { profileImage: '', bio: '', shortDescription: '' }));
        this.userID.next('');
      } else {
        let receivedLocalData = false;
        if (res.emailVerified) {
          this.userReference = this.afs.doc(`/users/${ res.uid }`);
          this.userID.next(res.uid);
          dataRef = this.userReference.snapshotChanges();
          dataSubscription = dataRef.pipe(
            map(response => Object.assign({ 'uid': res.uid, 'exists': response.payload.exists, 'data': response.payload.data() })),
            tap(user => localStorage.setItem('user', JSON.stringify(user))),
            startWith(JSON.parse(localStorage.getItem('user')))
          ).subscribe((response) => {
            if (!receivedLocalData) {
              // get existing local storage
              console.log('Received Local Data: ', response);
              this.localUserData = response;
              receivedLocalData = true;
              if (this.localUserData.data === undefined) {
                this.localUserData.firstName = '';
              }
            }
            if (response !== null) {
              if (response.exists === false && response.uid === res.uid) {
                if (this.localUserData.firstName === '') {
                  const data = new User('', '', res.email, { profileImage: res.photoURL, bio: '', shortDescription: '' });
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
          }, (error) => { console.log('There was an error: ' + error); });
        } else {
          this.userData.next(new User('', '', '', { profileImage: '', bio: '', shortDescription: '' }));
          this.userID.next('');
        }
      }
    });
  }
  public updateProfile(data: Object) {
    if (data instanceof User) {
      return this.userReference.update(Utils.toJson(data));
    }
    return this.userReference.update(data);
  }

  public addStudy(studyID: string, role: 'member' | 'admin' | 'leader') {
    return this.userReference.collection('studies').doc(studyID).set({ 'id': studyID, 'role': role });
  }

  public getNotifications() {
    const uid = this.userID.getValue();
    if (uid === '') {
      return of([]);
    }
    return this.afs.doc(`users/${ uid }`).collection('notifications').snapshotChanges().pipe(
      map((val) => {
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

  public clearNotifications(notificationIDs: string[]) {
    const uid = this.userID.getValue();
    if (uid === '') {
      return;
    }
    const notificationsRef = this.afs.doc(`users/${ uid }`).collection('notifications');
    const promises = [];
    notificationIDs.forEach((id) => {
      promises.push(notificationsRef.doc(id).delete());
    });
    return Promise.all(promises);
  }

  public markNotificationAsRead(notificationID: string) {
    const uid = this.userID.getValue();
    if (uid === '') {
      return;
    }
    return this.afs.doc(`users/${ uid }`).collection('notifications').doc(notificationID).update({ read: true });
  }

  public getStudyData(groupID: string) {
    return this.afs.doc(`/studies/${ groupID }`).valueChanges();
  }


  public logout() {
    return this._auth.logout().then(() => {
      localStorage.removeItem('user');
    });
  }

  public get user() {
    return this.userData;
  }

  getDataFromID(uid) {
    return this.afs.collection('users').doc(uid).valueChanges();
  }
}
