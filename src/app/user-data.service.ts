import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './interfaces/user-data.interface';
import { User } from './interfaces/user';
import { Utils } from './utilities/utils';

@Injectable()
export class UserDataService {
  userData: BehaviorSubject<User> = new BehaviorSubject(null);
  userID: BehaviorSubject<string> = new BehaviorSubject('');
  userReference: AngularFirestoreDocument<any>;
  constructor(private _auth: AuthService, public afs: AngularFirestore) {
    this._auth.authState.subscribe((res) => {
      if (res === null) {
        this.userData.next(new User('', '', '', { profileImage: '', bio: '', shortDescription: '' }));
        this.userID.next('');
        console.log('creating default user');
      } else {
        console.log('User is logged in: ' + res.email);
        this.userReference = this.afs.doc(`/users/${ res.uid }`);
        if (res.emailVerified) {
          this.userID.next(res.uid);
          this.userReference.snapshotChanges().subscribe((response) => {
            if (response.payload.exists === false) {
              console.log('waiting to see if any data is updated');
              setTimeout(() => {
                console.log('didn\'t receive update in 5 seconds...');
                const data = new User('', '', res.email, { profileImage: res.photoURL, bio: '', shortDescription: '' });
                this.userReference.set(Utils.toJson(data));
                console.log('added to firebase collection');
              }, 5000);
            } else {
              const data = response.payload.data() as User;
              if (data.email !== res.email) {
                data.email = res.email;
                this.userReference.update(data);
              }
              this.userData.next(data);
            }
          });
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
