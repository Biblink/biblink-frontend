import { Annotation } from '../../core/interfaces/annotation';

import { take, pluck } from 'rxjs/operators';
import 'rxjs/add/operator/take';
import { Group } from '../../core/interfaces/group';
import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { UserDataInterface } from '../../core/interfaces/user-data.interface';
import { User } from '../../core/interfaces/user';
import { Utils } from '../../utilities/utils';
import { UserDataService } from '../../core/services/user-data/user-data.service';
import { GroupDataInterface } from '../../core/interfaces/group-data.interface';
import { Post } from '../../core/interfaces/post';
import { Reply } from '../../core/interfaces/reply';
import { StudyModule } from '../study.module';



@Injectable()
export class StudyDataService {
  studies: BehaviorSubject<GroupDataInterface[]> = new BehaviorSubject([]);
  study_sync = [];
  study_indices = [];
  constructor(private user: UserDataService, public afs: AngularFirestore) {
    let groupsReference: AngularFirestoreCollection = null;
    let groupSubscription: Subscription = null;
    const studySubscriptions: Subscription[] = [];
    let isLoggedOut = false;
    this.user.userID.subscribe((uid) => {
      if (uid === '') {
        this.studies.next([]);
        isLoggedOut = true;
        groupsReference = null;
        if (groupSubscription !== null) {
          groupSubscription.unsubscribe();
        }

        if (studySubscriptions.length > 0) {
          studySubscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
          });
        }
      } else {
        groupsReference = this.afs.collection(`/users/${ uid }/studies`);
        groupSubscription = groupsReference.valueChanges().subscribe((groups) => {
          this.study_sync = [];
          if (groups.length === 0) {
            console.log('this person does not have any groups');
          }
          groups.forEach((studyData) => {
            // get study data
            let isFirstTime = false;
            let metadata = {};
            studySubscriptions.push(this.afs.doc(`/studies/${ studyData[ 'id' ] }`).valueChanges().subscribe((data) => {
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
            }));
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

  promoteUser(uid: string, studyId: string, role: string) {
    return this.afs.doc(`/studies/${ studyId }`)
      .collection('members')
      .doc(uid)
      .update({ 'role': role });
  }

  // updatePost(studyID: string) {
  //   this.afs.doc(`/studies/${ studyID }`).collection('posts').snapshotChanges().subscribe((res) => {
  //     res.forEach((post) => {
  //       const id = post.payload.doc.id;
  //       this.afs.doc(`/studies/${ studyID }`).collection('posts').doc(id).update({ id: id });
  //     });
  //   });
  // }

  async checkAuthorized(uid: string, studyId: string, roles: string[]) {
    const userStudyRef = this.afs.doc(`users/${ uid }`).collection('studies').doc(studyId);
    let isAuthorized = false;
    await userStudyRef.valueChanges().take(1).pipe(pluck('role')).subscribe((role: string) => {
      if (roles.indexOf(role) !== -1) {
        isAuthorized = true;
      } else {
        isAuthorized = false;
      }
    });
    return isAuthorized;
  }

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

  getAnnotationsByChapterReference(studyID: string, chapterReference: string, orderBy: string = 'timestamp') {
    // TODO: @jfan1256, implement orderBy here. Similar to getPosts function
    return this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations').valueChanges();
  }

  addSearchAttrToAnnotation(studyID: string, chapterReference: string, annotationID: string, searchValue: number) {
    this.afs.doc(`/studies/${ studyID }`)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID).update({ verse_search: searchValue });
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
    return this.afs.doc(`/studies/${ studyID }`).collection('members').doc(uid).valueChanges();
  }

  formatAnnotations(reference, returnVersesList = false) {
    const bookChapter = reference.slice(0, reference.indexOf(':')); // Example: Genesis 1:1,2,3,4 => Genesis 1
    let verses = reference.slice(reference.indexOf(':') + 1, reference.length); // Example: Genesis 1:1,2,3,4 => 1,2,3,4
    verses = verses.trim();
    if (verses.endsWith(',')) {
      verses = verses.slice(0, -1);
    }
    if (verses.startsWith(',')) {
      verses = verses.slice(1);
    }
    verses.match(/(,){0,1}(\d){1,2}(-)(\d){1,2}(,){0,1}/g).forEach((match) => {
      if (match.endsWith(',')) {
        match = match.slice(0, -1);
      }
      if (match.startsWith(',')) {
        match = match.slice(1);
      }
      const matchContainer = match.split('-');
      let lo_early = Number(matchContainer[ 0 ]);
      const hi_early = Number(matchContainer[ 1 ]);
      let strbase = '';
      let firstTime = false;
      while (lo_early <= hi_early) {
        if (firstTime) {
          strbase += ',';
        }
        strbase += `${ lo_early }`;
        firstTime = true;
        lo_early += 1;
      }
      verses = verses.replace(match, strbase);
    });
    let digits = verses.split(','); // Creates array out of the verses
    // tslint:disable-next-line:forin
    for (const index in digits) {
      digits[ index ] = Number(digits[ index ]); // Iterate through the list and turn each element into an integer
    }
    digits = digits.sort(function (a, b) { return a - b; });
    digits = Array.from(new Set(digits)); // Ensures all verse numbers are in ascending order
    if (returnVersesList) {
      return digits;
    }
    let lo = digits[ 0 ];
    let hi = -1;
    const ranges = []; // Container for formatted verse segments
    for (const index in digits) {
      if (digits[ Number(index) + 1 ] - digits[ Number(index) ] === 1) { // If elements are adjacent on the number line...
        hi = digits[ Number(index) + 1 ]; // Increase the variable representing the end of a continuous range (like 1-4)
      } else if (digits[ Number(index) + 1 ] - digits[ Number(index) ] !== 1) { // If two elements of the array are not adjacent...
        // The two blocks below check to see if the failiure was the end of a range or a discrete jump
        if (hi === -1) {
          const strlo = String(lo);
          ranges.push(strlo);
          lo = digits[ Number(index) + 1 ];
          hi = -1;
        } else if (hi !== -1) {
          const strlo = String(lo);
          const strhi = String(hi);
          const range = strlo.concat('-', strhi);
          ranges.push(range);
          lo = digits[ Number(index) + 1 ];
          hi = -1;
        }
      } else if (Number(index) === (digits.length - 1)) { // If you're at the end of the array perform a failure check

        if (hi === -1) {
          ranges.push(String(lo));
          lo = digits[ Number(index) + 1 ];
          hi = -1;
          break; // Don't bother checking the last element because array[index + 1] is out of range
        } else if (hi !== -1) {
          const range = String(lo).concat('-', String(hi));
          ranges.push(range);
          lo = digits[ Number(index) + 1 ];
          hi = -1;
          break; // Don't bother checking the last element because array[index + 1] is out of range
        }
      }
    }
    const formattedDigits = ranges.join(',');
    const completeReference = bookChapter.concat(':', formattedDigits);
    return completeReference;
  }
}
