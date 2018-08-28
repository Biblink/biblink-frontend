import { Annotation } from '../../core/interfaces/annotation';

import { take, pluck } from 'rxjs/operators';
import 'rxjs/add/operator/take';
import { Group } from '../../core/interfaces/group';
import { Injectable, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { UserDataInterface } from '../../core/interfaces/user-data.interface';
import { User } from '../../core/interfaces/user';
import { Utils } from '../../utilities/utils';
import { UserDataService } from '../../core/services/user-data/user-data.service';
import { GroupDataInterface } from '../../core/interfaces/group-data.interface';
import { Post } from '../../core/interfaces/post';
import { Reply } from '../../core/interfaces/reply';
import { StudyModule } from '../study.module';
import { Topic } from '../../core/interfaces/topic';

/**
 * Study data service to handle all study-related database calls
 */
@Injectable()
export class StudyDataService {
  /**
   * List of all of user's studies metadata
   */
  studies: BehaviorSubject<GroupDataInterface[]> = new BehaviorSubject([]);
  /**
   * Intermediate array to handle metadata changes
   */
  study_sync = [];

  /**
   * Initializes dependencies and does dependency injection
   * @param {UserDataService} user User data service to access user data
   * @param {AngularFirestore} afs AngularFirestore instance to access firestore
   */
  constructor(private user: UserDataService, public afs: AngularFirestore) {
    let groupsReference: AngularFirestoreCollection = null;
    let groupSubscription: Subscription = null;
    const studySubscriptions: Subscription[] = [];
    let isLoggedOut = false;
    this.user.userID.subscribe(uid => {
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
        groupSubscription = groupsReference.valueChanges().subscribe(groups => {
          this.study_sync = [];
          groups.forEach(studyData => {
            // get study data
            let isFirstTime = false;
            let metadata = {};
            studySubscriptions.push(
              this.afs
                .doc(`/studies/${ studyData[ 'id' ] }`)
                .valueChanges()
                .subscribe(data => {
                  data[ 'metadata' ][ 'name' ] = data[ 'name' ];
                  data[ 'metadata' ][ 'role' ] = studyData[ 'role' ];
                  data[ 'metadata' ][ 'id' ] = studyData[ 'id' ];
                  if (!isFirstTime) {
                    this.study_sync.push(data[ 'metadata' ]);
                    isFirstTime = true;
                    metadata = data[ 'metadata' ];
                  } else {
                    this.study_sync[ this.study_sync.indexOf(metadata) ] =
                      data[ 'metadata' ];
                    metadata = data[ 'metadata' ];
                  }
                  this.studies.next(this.study_sync);
                })
            );
          });
        });
      }
    });
  }
  /**
   * Creates a study
   * @param {string} name Name of study
   * @param {string} userID User ID
   * @param {GroupDataInterface} data Study data
   */
  createStudy(name: string, userID: string, data: GroupDataInterface) {
    const uniqueID = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    const firebaseData = { name: name, uniqueID: uniqueID, metadata: data };
    firebaseData[ 'search_name' ] = firebaseData[ 'name' ]
      .replace(/\s/g, '')
      .toLowerCase();
    const firebaseID = this.afs.createId();
    const studyRef = this.afs.doc(`/studies/${ firebaseID }`);
    return studyRef.set(firebaseData).then(() => {
      studyRef
        .collection('members')
        .doc(userID)
        .set({ role: 'leader', uid: userID });
      return firebaseID;
    });
  }
  /**
   * Joins a study
   * @param {string} name Name of study
   * @param {number} studyID Study ID
   */
  joinStudy(name: string, studyID: number) {
    return this.afs
      .collection(`/studies/`, ref =>
        ref.where('search_name', '==', name).where('uniqueID', '==', studyID)
      )
      .snapshotChanges();
  }
  /**
   * Adds a user to a study
   * @param studyID Study ID
   * @param userID User ID
   */
  addMember(studyID, userID) {
    return new Promise((resolve, reject) => {
      const doc = this.afs.collection('studies').doc(studyID);
      doc
        .collection('members')
        .doc(userID)
        .snapshotChanges()
        .pipe(take(1))
        .subscribe(res => {
          if (!res.payload.exists) {
            doc
              .collection('members')
              .doc(userID)
              .set({ uid: userID, role: 'member' });
            resolve();
          } else {
            reject('already added');
          }
        });
    });
  }
  /**
   * Gets study data based on ID
   * @param studyID Study ID
   */
  getStudyData(studyID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .valueChanges();
  }

  /**
   * Creates a post in a study
   * @param {string} studyID Study ID
   * @param {Post} post Post data
   */
  createPost(studyID: string, post: Post) {
    const firebaseID = this.afs.createId();
    const jsonPost = Utils.toJson(post);
    jsonPost[ 'id' ] = firebaseID;
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(firebaseID)
      .set(jsonPost);
  }

  /**
   * Creates an annotation in a study
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter Reference
   * @param {Annotation} annotation Annotation data
   */
  createAnnotation(
    studyID: string,
    chapterReference: string,
    annotation: Annotation
  ) {
    const firebaseID = this.afs.createId();
    const jsonPost = Utils.toJson(annotation);
    jsonPost[ 'id' ] = firebaseID;
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(firebaseID)
      .set(jsonPost);
  }
  /**
   * Adds a post reply to a given post ID
   * @param {string} postID Post ID
   * @param {string} studyID Study ID
   * @param {Reply} reply Reply data
   */
  addPostReply(postID: string, studyID: string, reply: Reply) {
    const firebaseID = this.afs.createId();
    const jsonReply = Utils.toJson(reply);
    jsonReply[ 'id' ] = firebaseID;
    const ref = this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(`${ postID }`);
    const updateContributor = ref.valueChanges().subscribe(val => {
      if (val[ 'contributors' ].indexOf(reply.creatorID) === -1) {
        val[ 'contributors' ].push(reply.creatorID);
      }
      ref.update(val).then(() => {
        updateContributor.unsubscribe();
      });
    });
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(postID)
      .collection('replies')
      .doc(firebaseID)
      .set(jsonReply);
  }
  /**
   * Adds an annotation reply to a given annotation ID
   * @param {string} annotationID Annotation ID
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter Reference
   * @param {Reply} reply Reply Data
   */
  addAnnotationReply(
    annotationID: string,
    studyID: string,
    chapterReference: string,
    reply: Reply
  ) {
    const firebaseID = this.afs.createId();
    const jsonReply = Utils.toJson(reply);
    jsonReply[ 'id' ] = firebaseID;
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .collection('replies')
      .doc(firebaseID)
      .set(jsonReply);
  }
  /**
   * Updates a certain post
   * @param {string} studyID Study ID
   * @param {string} postID Post ID
   * @param {Post} post New Post Data
   */
  updatePost(studyID: string, postID: string, post: Post) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(postID)
      .update(post);
  }
  /**
   * Updates a certain annotation
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chpater Reference
   * @param {string} annotationID Annotation ID
   * @param {Annotation} annotation New Annotation Data
   */
  updateAnnotation(
    studyID: string,
    chapterReference: string,
    annotationID: string,
    annotation: Annotation
  ) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .update(annotation);
  }
  /**
   * Updates a user's role in a particular study
   * @param {string} uid User ID
   * @param {string} studyID Study ID
   * @param {string} role Role to promote to
   */
  promoteUser(uid: string, studyID: string, role: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('members')
      .doc(uid)
      .update({ role: role });
  }

  /**
   * Get posts of a study
   * @param {string} studyID Study ID
   * @param {string} startAfter Starting point (Timestamp)
   * @param {number} limit Limit amount of posts returned
   */
  getPosts(studyID: string, startAfter: string = '', limit: number = 4) {
    if (startAfter !== '') {
      return this.afs
        .collection('studies')
        .doc(studyID)
        .collection('posts', ref =>
          ref
            .orderBy('timestamp', 'desc')
            .startAfter(startAfter)
            .limit(limit)
        )
        .valueChanges();
    }
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts', ref => ref.orderBy('timestamp', 'desc').limit(limit))
      .valueChanges();
  }
  /**
   * Gets key announcements of a study (Top 3 Most Recent Announcements)
   * @param {string} studyID Study ID
   */
  getKeyAnnouncements(studyID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts', ref =>
        ref
          .where('type', '==', 'announcement')
          .orderBy('timestamp', 'desc')
          .limit(3)
      )
      .valueChanges();
  }
  /**
   * Gets all posts based on a certain type
   * @param studyID Study ID
   * @param type Post Type
   * @param startAfter Timestamp to start after
   * @param limit The max number of posts returned
   */
  getPostByType(studyID: string, type: string, startAfter = '', limit = 10) {
    if (startAfter !== '') {
      return this.afs
        .collection('studies')
        .doc(studyID)
        .collection('posts', ref =>
          ref
            .where('type', '==', type)
            .orderBy('timestamp', 'desc')
            .startAfter(startAfter)
            .limit(limit)
        )
        .valueChanges();
    }
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts', ref =>
        ref
          .where('type', '==', type)
          .orderBy('timestamp', 'desc')
          .limit(limit)
      )
      .valueChanges();
  }
  /**
   * Gets post data based on an ID
   * @param {string} studyID Study ID
   * @param {string} postID Post ID
   */
  getPostByID(studyID: string, postID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(postID)
      .valueChanges();
  }
  /**
   * Gets annotation data based on an ID
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter reference
   * @param {string} annotationID Annotation ID
   */
  getAnnotationByID(
    studyID: string,
    chapterReference: string,
    annotationID: string
  ) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .valueChanges();
  }
  /**
   * Gets all annotations for a chapter
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter Reference
   * @param {string} order Sort type
   */
  getAnnotationsByChapterReference(
    studyID: string,
    chapterReference: string,
    order: string = 'timestamp'
  ) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations', ref => {
        if (order === 'timestamp') {
          return ref.orderBy(order, 'desc');
        }
        return ref.orderBy(order, 'asc');
      })
      .valueChanges();
  }
  /**
   * Adds a search attribute to an annotation for proper annotation sorting
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter Reference
   * @param {string} annotationID Annotation ID
   * @param {number} searchValue Search Value
   */
  addSearchAttrToAnnotation(
    studyID: string,
    chapterReference: string,
    annotationID: string,
    searchValue: number
  ) {
    this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .update({ verse_search: searchValue });
  }
  /**
   * Gets all replies of a certain post
   * @param {string} studyID Study ID
   * @param {string} postID Post ID
   */
  getPostRepliesByID(studyID: string, postID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(postID)
      .collection('replies')
      .valueChanges();
  }
  /**
   * Gets all replies of a certain annotation
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter Reference
   * @param {string} annotationID Annotation ID
   */
  getAnnotationRepliesByID(
    studyID: string,
    chapterReference: string,
    annotationID: string
  ) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .collection('replies')
      .valueChanges();
  }
  /**
   * Gets all members of a study
   * @param {string} studyID Study ID
   */
  getMembers(studyID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('members')
      .valueChanges();
  }
  /**
   * Deletes a post
   * @param {string} studyID Study ID
   * @param {string} postID Post ID
   */
  deletePost(studyID: string, postID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('posts')
      .doc(postID)
      .delete();
  }
  /**
   * Deletes an annotation
   * @param {string} studyID Study ID
   * @param {string} chapterReference Chapter Reference
   * @param {string} annotationID Annotation ID
   */
  deleteAnnotation(
    studyID: string,
    chapterReference: string,
    annotationID: string
  ) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('annotations')
      .doc(chapterReference)
      .collection('chapter-annotations')
      .doc(annotationID)
      .delete();
  }
  /**
   * Gets a study member's data
   * @param {string} studyID Study ID
   * @param {string} uid User ID
   */
  getMemberData(studyID: string, uid: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('members')
      .doc(uid)
      .valueChanges();
  }

  /**
   * Creates a discussion topic in a study
   * @param {string} studyID Study ID
   * @param {Topic} topic Topic data
   */
  createDiscussionTopic(
    studyID: string,
    topic: Topic
  ) {
    const firebaseID = this.afs.createId();
    const jsonTopic = Utils.toJson(topic);
    jsonTopic[ 'id' ] = firebaseID;
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('topics')
      .add(jsonTopic);
  }

  /**
   * Gets discussion topic based on ID
   * @param {string} studyID Study ID
   * @param {string} postID Post ID
   */
  getDiscussionTopicById(studyID: string, topicID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('topics')
      .doc(topicID)
      .valueChanges();
  }

  /**
   * Gets discussion by on ID
   * @param {string} studyID Study ID
   * @param {string} topicID Topic ID
   * @param {string} discussionID Discussion ID
   */
  getDiscussionByID(studyID: string, topicID: string, discussionID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('topics')
      .doc(topicID)
      .collection('discussions')
      .doc(discussionID)
      .valueChanges();
  }

  /**
   * Deletes a discussion
   * @param {string} studyID Study ID
   * @param {string} topic Topic ID
   * @param {string} discussionID Discussion ID
   */
  deleteDiscussion(studyID: string, topicID: string, discussionID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('topics')
      .doc(topicID)
      .collection('discusssions')
      .doc(discussionID)
      .delete();
  }

  /**
   * Gets all topics from a study
   * @param {string} studyID Study ID
   */
  getTopics(studyID: string) {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('topics')
      .valueChanges();
  }
  /**
   * Gets all discussions for a specific topic
   * @param {string} studyID Study ID
   */
  getDiscussionsByTopic(studyID: string, topicID: string, order = 'timestamp') {
    return this.afs
      .collection('studies')
      .doc(studyID)
      .collection('topics')
      .doc(topicID)
      .collection('discussions', ref => {
        return ref.orderBy(order, 'desc');
      })
      .valueChanges();
  }

  /**
   * Formats a verse reference for an annotation
   * @example
   * formatAnnotatoins('Genesis 1:1,2,3,4)
   * This returns: Genesis 1:1-4
   *
   * @param {string} reference Verse Reference
   * @param {boolean} returnVersesList Whether or not to return verses list
   * @returns {string} formatted reference
   */
  formatAnnotations(reference: string, returnVersesList: boolean = false): any {
    const bookChapter = reference.slice(0, reference.indexOf(':')); // Example: Genesis 1:1,2,3,4 => Genesis 1
    let verses = reference.slice(reference.indexOf(':') + 1, reference.length); // Example: Genesis 1:1,2,3,4 => 1,2,3,4
    verses = verses.trim();
    if (verses.endsWith(',')) {
      verses = verses.slice(0, -1);
    }
    if (verses.startsWith(',')) {
      verses = verses.slice(1);
    }
    let matches = verses.match(/(,){0,1}(\d){1,2}(-)(\d){1,2}(,){0,1}/g);
    matches = matches === null ? [] : matches;
    matches.forEach(match => {
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
    const temp = verses.split(','); // Creates array out of the verses
    let digits: number[] = [];
    // tslint:disable-next-line:forin
    for (const index in temp) {
      digits.push(Number(temp[ index ])); // Iterate through the list and turn each element into an integer
    }
    digits = digits.sort((a: number, b: number) => a - b);
    digits = Array.from(new Set(digits)); // Ensures all verse numbers are in ascending order
    if (returnVersesList) {
      return digits;
    }
    let lo = digits[ 0 ];
    let hi = -1;
    const ranges = []; // Container for formatted verse segments
    // tslint:disable-next-line:forin
    for (const index in digits) {
      const i = Number(index);
      if (digits[ i + 1 ] - digits[ i ] === 1) {
        // If elements are adjacent on the number line...
        hi = digits[ i + 1 ]; // Increase the variable representing the end of a continuous range (like 1-4)
      } else if (digits[ i + 1 ] - digits[ i ] !== 1) {
        // If two elements of the array are not adjacent...
        // The two blocks below check to see if the failiure was the end of a range or a discrete jump
        if (hi === -1) {
          const strlo = String(lo);
          ranges.push(strlo);
          lo = digits[ i + 1 ];
          hi = -1;
        } else if (hi !== -1) {
          const strlo = String(lo);
          const strhi = String(hi);
          const range = strlo.concat('-', strhi);
          ranges.push(range);
          lo = digits[ i + 1 ];
          hi = -1;
        }
      } else if (i === digits.length - 1) {
        // If you're at the end of the array perform a failure check

        if (hi === -1) {
          ranges.push(String(lo));
          lo = digits[ i + 1 ];
          hi = -1;
          break; // Don't bother checking the last element because array[index + 1] is out of range
        } else if (hi !== -1) {
          const range = String(lo).concat('-', String(hi));
          ranges.push(range);
          lo = digits[ i + 1 ];
          hi = -1;
          break; // Don't bother checking the last element because array[index + 1] is out of range
        }
      }
    }
    const formattedDigits = ranges.join(',');
    const completeReference = bookChapter.concat(':', formattedDigits);
    return completeReference;
  }


  updateInfo(name, metadata, groupID: string) {
    return this.afs.collection('studies').doc(groupID).update({ name: name, metadata: metadata });
  }
}
