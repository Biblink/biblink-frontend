import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot, Action } from 'angularfire2/firestore';
import { Observable, BehaviorSubject, Subscription, of } from 'rxjs';
import { UserDataInterface } from '../../interfaces/user-data.interface';
import { User } from '../../interfaces/user';
import { Utils } from '../../../utilities/utils';
import { map, takeUntil } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  userData: BehaviorSubject<User> = new BehaviorSubject(null);
  userID: BehaviorSubject<string> = new BehaviorSubject('');
  userReference: AngularFirestoreDocument<any> = null;

  constructor(private _auth: AuthService, public afs: AngularFirestore) {
    let dataRef: Observable<Action<DocumentSnapshot<any>>> = null;
    let dataSubscription: Subscription = null;
    this._auth.authState.subscribe((res) => {
      if (res === null) {
        if (dataSubscription !== null) {
          dataSubscription.unsubscribe();
        }
        if (dataRef !== null) {
          dataRef = null;
        }
        this.userReference = null;
        this.userData.next(new User('', '', '', { profileImage: '', bio: '', shortDescription: '' }));
        this.userID.next('');
      } else {
        this.userReference = this.afs.doc(`/users/${ res.uid }`);
        if (res.emailVerified) {
          this.userID.next(res.uid);
          dataRef = this.userReference.snapshotChanges();
          dataSubscription = dataRef.subscribe((response) => {
            if (response.payload.exists === false) {
              const data = new User('', '', res.email, { profileImage: res.photoURL, bio: '', shortDescription: '' });
              this.userReference.set(Utils.toJson(data));
              console.log('added to firebase collection');
            } else {
              const data = response.payload.data() as User;
              if (data.email !== res.email) {
                data.email = res.email;
                this.userReference.update(data);
              }
              this.userData.next(data);
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
    return this._auth.logout();
  }

  public get user() {
    return this.userData;
  }

  getDataFromID(uid) {
    return this.afs.collection('users').doc(uid).valueChanges();
  }
}
