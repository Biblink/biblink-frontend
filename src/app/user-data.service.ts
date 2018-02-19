import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { UserDataInterface } from './interfaces/user-data.interface';
import { User } from './interfaces/user';
import { Utils } from './utilities/utils';

@Injectable()
export class UserDataService {
  userData: User;
  userReference: AngularFirestoreDocument<User>;
  constructor(private _auth: AuthService, private afs: AngularFirestore) {
    this._auth.authState.subscribe((res) => {
      if (res === null) {
        this.userData = new User('', '', {});
        console.log('creating default user');
      } else {
        this.userReference = this.afs.doc(`/users/${ res.uid }`);
        if (res.emailVerified) {
          this.userReference.valueChanges()
            .subscribe((response) => {
              if (response == null) {
                const data = new User('', res.email, {});
                this.userReference.set(Utils.toJson(data));
                console.log('added to firebase collection');
              } else {
                this.userData = response as User;
                console.log('received user data: ', this.userData);
              }
            });
        }
      }
    });
  }
}
