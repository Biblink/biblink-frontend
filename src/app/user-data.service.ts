import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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
          this.userReference.valueChanges().subscribe((response) => {
            if (response == null) {
              const data = new User('', '', res.email, { profileImage: res.photoURL, bio: '', shortDescription: '' });
              this.userReference.set(Utils.toJson(data));
              console.log('added to firebase collection');
            } else {
              if (response.email !== res.email) {
                response.email = res.email;
                this.userReference.update(response);
              }
              this.userData.next(response);
              console.log('received user data: ', this.userData.getValue());
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

  public addGroup(groupID: string, role: 'member' | 'admin' | 'leader') {
    return this.userReference.collection('groups').add({ 'id': groupID, 'role': role });
  }

  public get user() {
    return this.userData;
  }
}
