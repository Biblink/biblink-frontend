import { Annotation } from './interfaces/annotation';

import { take } from 'rxjs/operators';
import 'rxjs/add/operator/take';
import { Group } from './interfaces/group';
import { Injectable, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserDataInterface } from './interfaces/user-data.interface';
import { User } from './interfaces/user';
import { Utils } from './utilities/utils';
import { UserDataService } from './user-data.service';
import { GroupDataInterface } from './interfaces/group-data.interface';
import { Post } from './interfaces/post';


import { Reply } from './interfaces/reply';


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
    firebaseData[ 'search_name' ] = firebaseData[ 'name' ].replace(/\s/g, '').toLowerCase();
    const firebaseID = this.afs.createId();
    const studyRef = this.afs.doc(`/studies/${ firebaseID }`);
    return studyRef.set(firebaseData).then(() => {
      studyRef.collection('members').doc(userID).set({ 'role': 'leader', 'uid': userID });
      return firebaseID;
    });
  }

  joinStudy(name: string, groupID: number) {
    return this.afs.collection(`/studies/`, ref => ref.where('search_name', '==', name).where('uniqueID', '==', groupID)).snapshotChanges();
  }
  addMember(groupID, userID) {
    return new Promise((resolve, reject) => {
      const doc = this.afs.collection('studies').doc(groupID);
      doc.collection('members').doc(userID).snapshotChanges().pipe(take(1)).subscribe((res) => {
        if (!res.payload.exists) {
          doc.collection('members').doc(userID).set({ 'uid': userID, 'role': 'member' });
          resolve();
        } else {
          reject('already added');
        }
      });
    });

  }

  getStudyData(groupID: string) {
    return this.afs.doc(`/studies/${ groupID }`).valueChanges();
  }


  createPost(studyID: string, post: Post) {
    const firebaseID = this.afs.createId();
    const jsonPost = Utils.toJson(post);
    jsonPost[ 'id' ] = firebaseID;
    return this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(firebaseID).set(jsonPost);
  }
  createAnnotation(studyID: string, chapterReference: string, annotation: Annotation) {
    const firebaseID = this.afs.createId();
    const jsonPost = Utils.toJson(annotation);
    jsonPost[ 'id' ] = firebaseID;
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(firebaseID)
      .set(jsonPost);
  }

  addPostReply(postID: string, studyID: string, reply: Reply) {
    const firebaseID = this.afs.createId();
    const jsonReply = Utils.toJson(reply);
    jsonReply[ 'id' ] = firebaseID;
    const ref = this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(`${ postID }`);
    const updateContributor = ref.valueChanges().subscribe((val) => {
      if (val[ 'contributors' ].indexOf(reply.creatorID) === -1) {
        val[ 'contributors' ].push(reply.creatorID);
      }
      ref.update(val).then(() => {
        updateContributor.unsubscribe();
      });
    });
    return this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(postID).collection('replies').doc(firebaseID).set(jsonReply);
  }

  addAnnotationReply(annotationID: string, studyID: string, chapterReference: string, reply: Reply) {
    const firebaseID = this.afs.createId();
    const jsonReply = Utils.toJson(reply);
    jsonReply[ 'id' ] = firebaseID;
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .collection('replies')
      .doc(firebaseID)
      .set(jsonReply);
  }

  updatePost(studyID: string, postID: string, post: Post) {
    return this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(postID).update(post);
  }
  updateAnnotation(studyID: string, chapterReference: string, annotationID: string, annotation: Annotation) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID).update(annotation);
  }

  // updatePost(studyID: string) {
  //   this.afs.doc(`/studies/${ studyID }`).collection('posts').snapshotChanges().subscribe((res) => {
  //     res.forEach((post) => {
  //       const id = post.payload.doc.id;
  //       this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(id).update({ id: id });
  //     });
  //   });
  // }

  getPosts(studyID: string, startAfter = '', limit = 4) {
    if (startAfter !== '') {
      return this.afs.doc(`/studies/${ studyID }`).collection('posts',
        ref => ref.orderBy('timestamp', 'desc')
          .startAfter(startAfter)
          .limit(limit))
        .valueChanges();
    }
    return this.afs.doc(`/studies/${ studyID }`).collection('posts',
      ref => ref.orderBy('timestamp', 'desc')
        .limit(limit))
      .valueChanges();
  }

  getKeyAnnouncements(studyID: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('posts', ref => ref.where('type', '==', 'announcement').orderBy('timestamp', 'desc').limit(3)).valueChanges();
  }

  getPostByType(studyID: string, type: string, startAfter = '', limit = 10) {
    if (startAfter !== '') {
      return this.afs.doc(`/studies/${ studyID }`)
        .collection('posts', ref => ref.where('type', '==', type)
          .orderBy('timestamp', 'desc')
          .startAfter(startAfter)
          .limit(limit))
        .valueChanges();
    }
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('posts', ref => ref.where('type', '==', type)
        .orderBy('timestamp', 'desc')
        .limit(limit))
      .valueChanges();
  }

  getPostByID(studyID: string, postID: string) {
    return this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(postID).valueChanges();
  }

  getAnnotationByID(studyID: string, chapterReference: string, annotationID: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID).valueChanges();
  }

  getAnnotationsByChapterReference(studyID: string, chapterReference: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations').valueChanges();
  }

  getPostRepliesByID(studyID: string, postID: string) {
    return this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(postID).collection('replies').valueChanges();
  }

  getAnnotationRepliesByID(studyID: string, chapterReference: string, annotationID: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .collection('replies').valueChanges();
  }

  getMembers(studyID: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('members').valueChanges();
  }

  deletePost(studyID: string, postID: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('posts').doc(postID).delete();
  }

  deleteAnnotation(studyID: string, chapterReference: string, annotationID: string) {
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .delete();
  }

  getMemberData(studyID: string, uid: string) {
    console.log(uid);
    return this.afs.doc(`/studies/${ studyID }`).collection('members').doc(uid).valueChanges();
  }
}
