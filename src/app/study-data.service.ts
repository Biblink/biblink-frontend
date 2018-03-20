import { Group } from './interfaces/group';
import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UserDataInterface } from './interfaces/user-data.interface';
import { User } from './interfaces/user';
import { Utils } from './utilities/utils';
import { UserDataService } from './user-data.service';
import { GroupDataInterface } from './interfaces/group-data.interface';
import { Post } from './interfaces/post';


@Injectable()
export class StudyDataService {
  studies: BehaviorSubject<GroupDataInterface[]> = new BehaviorSubject([]);
  study_sync = [];
  study_indices = [];
  constructor(private user: UserDataService, public afs: AngularFirestore) {
    this.user.userID.subscribe((uid) => {
      if (uid === '') {
        this.studies.next([]);
      } else {
        const groupsReference = this.afs.collection(`/users/${ uid }/studies`);
        groupsReference.valueChanges().subscribe((groups) => {
          this.study_sync = [];
          if (groups.length === 0) {
            console.log('this person does not have any groups');
          }
          groups.forEach((studyData) => {
            // get study data
            let isFirstTime = false;
            let metadata = {};
            this.afs.doc(`/studies/${ studyData[ 'id' ] }`).valueChanges().subscribe((data) => {
              data[ 'metadata' ][ 'name' ] = data[ 'name' ];
              data[ 'metadata' ][ 'role' ] = studyData[ 'role' ];
              data[ 'metadata' ][ 'id' ] = studyData[ 'id' ];
              if (!isFirstTime) {
                this.study_sync.push(data[ 'metadata' ]);
                isFirstTime = true;
                metadata = data[ 'metadata' ];
              } else {
                this.study_sync[ this.study_sync.indexOf(metadata) ] = data[ 'metadata' ];
                metadata = data[ 'metadata' ];
              }
              this.studies.next(this.study_sync);
            });
          });
        });
      }
    });
  }

  createStudy(name: string, userID: string, data: GroupDataInterface) {
    const uniqueID = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    const firebaseData = { 'name': name, 'uniqueID': uniqueID, 'metadata': data };
    const firebaseID = this.afs.createId();
    const studyRef = this.afs.doc(`/studies/${ firebaseID }`);
    return studyRef.set(firebaseData).then(() => {
      studyRef.collection('members').doc(userID).set({ 'role': 'leader', 'uid': userID });
      return firebaseID;
    });
  }
  addMember(reference: AngularFirestoreDocument<any>, memberData) {
    return reference.collection('members').add(memberData);
  }

  getStudyData(groupID: string) {
    return this.afs.doc(`/studies/${ groupID }`).valueChanges();
  }


  createPost(studyID: string, post: Post) {
    return this.afs.doc(`/studies/${ studyID }`).collection('posts').add(Utils.toJson(post));
  }

  getPosts(studyID: string) {
    return this.afs.doc(`/studies/${ studyID }`).collection('posts', ref => ref.orderBy('timestamp', 'desc')).valueChanges();
  }

  getPostByType(studyID: string, type: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('posts', ref => ref.where('type', '==', type).orderBy('timestamp', 'desc')).valueChanges();
  }

}
