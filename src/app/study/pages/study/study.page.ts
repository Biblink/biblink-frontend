import { LegalRoutingModule } from './../../../legal/legal-routing.module';
import { Title } from '@angular/platform-browser';

import { scan, map, pluck } from 'rxjs/operators';
import { SearchService } from '../../../core/services/search/search.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StudyDataService } from '../../services/study-data.service';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { ToastrService } from 'ngx-toastr';
import * as firebase from 'firebase';

import { Reply } from '../../../core/interfaces/reply';
import { Post } from '../../../core/interfaces/post';
import { Annotation } from '../../../core/interfaces/annotation';
import { PatternValidator } from '@angular/forms';

declare const $: any;
@Component({
  selector: 'app-study',
  templateUrl: './study.page.html',
  styleUrls: [ './study.page.css' ]
})

export class StudyComponent implements OnInit, OnDestroy {
  editPostSubscription: Subscription = new Subscription();
  chapterAnnotationsSubscription: Subscription = new Subscription();
  editAnnotationSubscription: Subscription = new Subscription();
  getMorePostSubscription: Subscription = new Subscription();
  chapterSubscription: Subscription = new Subscription();
  membersSubscription: Subscription = new Subscription();
  keyAnnouncementSubscription: Subscription = new Subscription();

  postSubscription: Subscription = new Subscription();
  roleSubscription: Subscription = new Subscription();
  userIDSubscription: Subscription = new Subscription();
  studyDataSubscription: Subscription = new Subscription();
  userDataSubscription: Subscription = new Subscription();
  searchSubscription: Subscription = new Subscription();
  title = '';
  groupUniqueID = '';
  chapterRef = '';
  profileImage = '';
  bibleData = {};
  underlinedVerses = [];
  darkenedVerses = [];
  countVerses = [];
  numChapters = 50;
  books = [];
  activeBook = 'Genesis';
  activeChapter = 1;
  numberOfMembers = 3;
  currentTab = 'feed';
  actionsExpanded = false;
  creationExpanded = false;
  createPost = new Post();
  createAnnotation = new Annotation();
  postLength = 1;
  type = 'all';
  editing = false;
  editingAnnotation = false;
  resetPosts = false;
  editingPostID = '';
  editingAnnotationID = '';
  name = '';
  posts: Observable<any>;
  chapterAnnotations: Observable<any>;
  numOfAnnotations = 1;
  postIndices = [];
  members = [];
  studyData;
  keyAnnouncements = [];
  isLeader = false;
  private _posts = new BehaviorSubject([]);
  isLoading = new BehaviorSubject<boolean>(true);
  isDone = false;
  userID = '';
  groupID = '';
  isGettingMorePosts = false;
  isVisibleLinks = true;
  isVisibleVerses = true;
  activatePromotionModal = false;
  currentPromote: Object = { name: '', uid: '' };
  constructor(private _router: Router,
    private _title: Title,
    private _search: SearchService,
    private _study: StudyDataService,
    private _user: UserDataService,
    private toastr: ToastrService) {

  }
  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.roleSubscription.unsubscribe();
    this.userDataSubscription.unsubscribe();
    this.userIDSubscription.unsubscribe();
    this.postSubscription.unsubscribe();
    this.membersSubscription.unsubscribe();
    this.chapterSubscription.unsubscribe();
    this.editPostSubscription.unsubscribe();
    this.keyAnnouncementSubscription.unsubscribe();
  }
  ngOnInit() {
    this.searchSubscription = this._search.getBooks().subscribe((res) => {
      this.books = res[ 'data' ];
      this.books.forEach((book, index) => {
        const words = book.split(' ');
        const fixed = [];
        words.forEach((word) => {
          if (word === 'of') {
            fixed.push(word);
          } else {
            fixed.push(this.capitalize(word));
          }
        });
        const fixedBook = fixed.join(' ');
        this.books[ index ] = fixedBook;
      });
    });
    this.userDataSubscription = this._user.userData.subscribe((user) => {
      if (user !== null) {
        this.profileImage = user.data.profileImage;
        this.name = user.name;
      }
    });
    this.groupID = this._router.url.split('/').pop();
    this.studyDataSubscription = this._study.getStudyData(this.groupID).subscribe((data) => {
      this.title = data[ 'name' ];
      this._title.setTitle(this.title);
      this.groupUniqueID = data[ 'uniqueID' ];
      this.studyData = data;
    });
    this.userIDSubscription = this._user.userID.subscribe((res) => {
      if (res !== '') {
        this.userID = res;
        this.roleSubscription = this._study.getMemberData(this.groupID, res).subscribe((response) => {
          if (response[ 'role' ] === 'leader') {
            this.isLeader = true;
          } else {
            this.isLeader = false;
          }
        });
      }
    });
    this.getPosts();
    this.getMembers();
    this.getKeyAnnouncements();
    this.posts = this._posts.asObservable().pipe(
      scan((acc, val) => {
        if (val.length === 0) {
          this.isDone = true;
          this.isLoading.next(false);
        } else {
          this.isDone = false;
          this.isLoading.next(true);
        }
        if (this.resetPosts) {
          this.resetPosts = false;
          this.postIndices = [];
          this.isDone = false;
          val.forEach((post) => {
            this.postIndices.push(post[ 'id' ]);
          });
          this.isLoading.next(false);
          this.postLength = val.length;
          return acc = val;
        }
        if (this.isDone) {
          this.isLoading.next(false);
          return acc;
        }
        const valid = [];
        val.forEach((post) => {
          const index = this.postIndices.indexOf(post[ 'id' ]);
          if (index !== -1) {
            this.postIndices[ index ] = post[ 'id' ];
            acc[ index ] = post;
          } else {
            if (this.isGettingMorePosts) {
              this.postIndices.push(post[ 'id' ]);
            } else {
              this.postIndices.unshift(post[ 'id' ]);
            }
            valid.push(post);
          }
        });
        this.isLoading.next(false);
        this.postLength = acc.length + valid.length;
        if (this.isGettingMorePosts) {
          acc = acc.concat(valid);
        } else {
          acc = valid.concat(acc);
        }
        this.isGettingMorePosts = false;
        return acc;
      }));
    // this._study.updatePost(this.groupID);
  }

  resetPost() {
    this.createPost = new Post();
  }

  resetAnnotation() {
    this.createAnnotation = new Annotation();
  }

  setPostType(type: string) {
    this.createPost.type = type;
    this.toggleCreation(true);
  }

  setAnnotationType(type: string) {
    this.createAnnotation.type = type;
    this.toggleCreation(true, true);
  }

  verifyPromote(name: string, uid) {
    this.activatePromotionModal = true;
    this.currentPromote[ 'name' ] = name;
    this.currentPromote[ 'uid' ] = uid;
  }

  promoteToLeader() {
    if (this.currentPromote[ 'name' ] !== '' && this.currentPromote[ 'uid' ] !== '') {
      if (this.isLeader) {
        this._study.promoteUser(this.currentPromote[ 'uid' ], this.groupID, 'leader').then(() => {
          this.toastr.show(`Successfully Promoted ${ this.currentPromote[ 'name' ] } to Leader`, 'Leader Promotion');
        });
      }
    }
  }
  getAnnouncements() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('announcement');
    this.type = 'announcement';
  }

  getQuestions() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('question');
    this.type = 'question';
  }
  getDiscussions() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('discussion');
    this.type = 'discussion';
  }

  private _getFeedByType(type: string): void {
    this.postSubscription = this._study.getPostByType(this.groupID, type).pipe(map(res => {
      res.map(val => this._checkHtmlText(val));
      return res;
    })).subscribe((res) => {
      this._posts.next(res);
    });
  }

  getPosts(limit = 10) {
    this.resetPosts = true;
    this.isLoading.next(true);
    this.postSubscription = this._study.getPosts(this.groupID, '', limit).pipe(map(res => {
      res.map(val => this._checkHtmlText(val));
      return res;
    })).subscribe((res) => {
      this._posts.next(res);
    });
    this.type = 'all';
  }

  getMorePosts(timestamp: string, limit = 10) {
    this.isGettingMorePosts = true;
    if (this.isDone) {
      return;
    }
    this.isLoading.next(true);
    setTimeout(() => {
      if (this.type === 'all') {

        this.getMorePostSubscription = this._study.getPosts(this.groupID, timestamp, limit).pipe(map(res => {
          res.map(val => this._checkHtmlText(val));
          return res;
        })).subscribe((res) => {
          this._posts.next(res);
        });
      } else {
        this.getMorePostSubscription =
          this._study.getPostByType(this.groupID, this.type, timestamp, limit).pipe(map(res => {
            res.map(val => this._checkHtmlText(val));
            return res;
          })).subscribe((res) => {
            this._posts.next(res);
          });
      }
    }, 1000);
  }
  private _checkHtmlText(val: any) {
    val[ 'htmlText' ] = val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '' ? val[ 'text' ] : val[ 'htmlText' ];
    return val;
  }

  getKeyAnnouncements() {
    this.keyAnnouncementSubscription = this._study.getKeyAnnouncements(this.groupID).pipe(map(res => {
      this.keyAnnouncements = [];
      res.map(val => {
        val = this._checkHtmlText(val);
        const contained = this.keyAnnouncements.filter(value => value[ 'id' ] === val[ 'id' ]);
        this._user.getDataFromID(val[ 'creatorID' ]).take(1).subscribe((response) => {
          val[ 'image' ] = response[ 'data' ][ 'profileImage' ];
          if (contained.length === 1) {
            this.keyAnnouncements[ this.keyAnnouncements.indexOf(contained[ 0 ]) ] = val;
          } else {
            this.keyAnnouncements.push(val);
          }
        });
      });
      return res;
    })).subscribe();
  }

  getMembers() {
    this.membersSubscription = this._study.getMembers(this.groupID).subscribe((members) => {
      this.members = [];
      members.forEach((member) => {
        let firstTime = false;
        let oldImage = { 'name': '', 'uid': '', 'image': '', 'role': '' };
        this._user.getDataFromID(member[ 'uid' ]).subscribe((res) => {
          if (firstTime) {
            this.members[ this.members.indexOf(oldImage) ] = {
              'name': res[ 'name' ],
              'image': res[ 'data' ][ 'profileImage' ],
              'role': member[ 'role' ],
              'uid': member[ 'uid' ],
            };
          } else {
            this.members.push({
              'name': res[ 'name' ],
              'uid': member[ 'uid' ],
              'image': res[ 'data' ][ 'profileImage' ],
              'role': member[ 'role' ]
            });
          }
          firstTime = true;
          oldImage = {
            'name': res[ 'name' ],
            'uid': member[ 'uid' ],
            'image': res[ 'data' ][ 'profileImage' ],
            'role': member[ 'role' ]
          };
        });
      });
    });
  }

  navigateTo(url) {
    this._router.navigateByUrl(url);
  }

  getVerse(event) {
    const spans = $('div#' + event.srcElement.id + '.card-body span');
    spans.each((index, el) => {
      const jElement = $(el);
      const parentDiv = jElement.parent();
      const reference = jElement.text();
      let verseText = '';
      const textSubscriber = this._search.getVerseText(reference).take(1).subscribe((res) => {
        verseText = res[ 'data' ][ 0 ][ 'combined_text' ];
        jElement.attr('data-tooltip', verseText.replace(/<\/?n>/g, ''));
        jElement.addClass('tooltip is-tooltip-bottom is-tooltip-multiline');
      });


      jElement.click(() => {
        this._router.navigateByUrl(`/search?query=${ reference }`);
      });
    });
  }

  getVerseLinks(event) {
    const spans = $('div#' + event.srcElement.id + ' .verse-container span');
    spans.each((index, el) => {
      const jElement = $(el);
      const reference = jElement.text();
      jElement.click(() => {
        this._router.navigateByUrl(`/search?query=${ reference.split(': ')[ 0 ] }`);
      });
    });
  }
  switchTab(val, override = false) {
    if (this.currentTab === val && !override) {
      return;
    }
    this.currentTab = val;
    this.resetPosts = true;
    this._posts.next([]);
    switch (this.currentTab) {
      case 'feed': {
        this.isLoading.next(true);
        setTimeout(() => {
          this.getPosts();
        }, 500);
        break;
      }
      case 'announcements': {
        this.isLoading.next(true);
        setTimeout(() => {
          this.getAnnouncements();
        }, 500);
        break;
      }
      case 'questions': {
        this.isLoading.next(true);
        setTimeout(() => {
          this.getQuestions();
        }, 500);
        break;
      }
      case 'discussions': {
        this.isLoading.next(true);
        setTimeout(() => {
          this.getDiscussions();
        }, 500);
        break;
      }
      case 'shared-bible': {
        this.isLoading.next(true);
        this.getChapter('Genesis', '1');
      }

    }
  }

  logout() {
    this._user.logout().then(() => {
      this.navigateTo('/sign-in');
    });
  }

  expandActions() {
    this.actionsExpanded = true;
  }

  toggleCreation(value: boolean, annotation = false) {
    if (annotation) {
      if (this.createAnnotation.type === '' && this.creationExpanded === false) {
        this.createAnnotation.type = 'note';
      }
    } else {
      if (this.createPost.type === '' && this.creationExpanded === false) {
        this.createPost.type = 'post';
      }
    }
    this.creationExpanded = value;
  }

  publishPost() {
    if (this.currentTab === 'shared-bible') {
      this.publishAnnotation();
      return;
    }
    if (this.editing) {
      return this.updatePost();
    }
    const today = new Date();
    const date = `${ today.getMonth() + 1 }/${ today.getDate() }/${ today.getFullYear() }`;
    const time = today.toLocaleTimeString();
    const postType = this.capitalize(this.createPost.type);
    this.createPost.dateInfo = { date: date, time: time };
    this.createPost.timestamp = Math.round((new Date()).getTime() / 1000);
    this.createPost.creatorID = this._user.userID.getValue();
    this.createPost.contributors.push(this.createPost.creatorID);
    this._study.createPost(this.groupID, this.createPost).then(() => {
      this.toastr.show('Successfully Created Your ' + postType,
        'Successful Creation of ' + postType);
      this.resetPost();
      this.toggleCreation(false);
      this.resetPosts = true;
      if (this.type === 'all') {
        this.getPosts();
      } else {
        this.switchTab(this.type + 's', true);
      }
    });
  }

  publishAnnotation() {
    if (this.editing) {
      return this.updateAnnotation();
    }

    this.createAnnotation.chapterReference = `${ this.activeBook.toLowerCase() }-${ this.activeChapter }`;
    const today = new Date();
    const date = `${ today.getMonth() + 1 }/${ today.getDate() }/${ today.getFullYear() }`;
    const time = today.toLocaleTimeString();
    const annotationType = this.capitalize(this.createAnnotation.type);
    console.log(annotationType);
    this.createAnnotation.dateInfo = { date: date, time: time };
    this.createAnnotation.timestamp = Math.round((new Date()).getTime() / 1000);
    this.createAnnotation.creatorID = this._user.userID.getValue();
    this._study.createAnnotation(this.groupID, this.createAnnotation.chapterReference, this.createAnnotation).then(() => {
      this.toastr.show('Successfully Created Your ' + annotationType,
        'Successful Creation of ' + annotationType);
      this.resetAnnotation();
      this.toggleCreation(false);
    });
  }

  updateAnnotation() {
    this.createAnnotation.htmlText = this.createAnnotation.text;
    this._study.updateAnnotation(this.groupID, this.chapterRef, this.editingAnnotationID, this.createAnnotation).then(() => {
      this.resetAnnotation();
      this.editingAnnotationID = '';
      this.editingAnnotation = false;
      this.editing = false;
      this.toastr.show('Successfully Edited Annotation');
      this.toggleCreation(false);
      this.actionsExpanded = false;
    });
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }

  checkIfExists(value) {
    return value === undefined || value === null || value === [] || value === {} || Object.keys(value).length === 0;
  }


  deletePost(value: boolean, postID: string,
    creatorID: string, isLeader: boolean) {
    this.resetPosts = true;

    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this._study.deletePost(this.groupID, postID).then(() => {
        this.toastr.show('Successfully Deleted Post');
      });
    }
  }

  editPost(value: boolean, postID: string, creatorID: string, isLeader: boolean) {
    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this.editing = true;
      this.editPostSubscription = this._study.getPostByID(this.groupID, postID).subscribe((res) => {
        if (this.editing) {
          this.createPost = res as Post;
          this.editingPostID = postID;
          this.expandActions();
          this.toggleCreation(true);
        }
      });
    }
  }
  editAnnotation(value: boolean, annotationID: string, creatorID: string, isLeader: boolean) {
    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this.editing = true;
      this.editingAnnotation = true;


      this.editAnnotationSubscription = this._study.getAnnotationByID(this.groupID,
        `${ this.activeBook.toLowerCase() }-${ this.activeChapter }`,
        annotationID).subscribe((res) => {
          if (this.editing) {
            this.createAnnotation = res as Annotation;
            this.editingAnnotationID = annotationID;
            this.expandActions();
            this.toggleCreation(true);
          }
        });
    }
  }

  getAnnotationsForChapter() {
    const chapterReference = `${ this.activeBook.toLowerCase() }-${ this.activeChapter }`;
    this.chapterAnnotations = this._study.getAnnotationsByChapterReference(this.groupID, chapterReference);
    this.chapterAnnotationsSubscription = this.chapterAnnotations.subscribe((res) => {
      this.numOfAnnotations = res.length;
      const countForAnnotations = [];
      const indexOfVerse = [];

      for (let j = 0; j < this.underlinedVerses.length; j++) {
        this.countVerses[ j ][ 'image' ] = [];
        this.countVerses[ j ][ 'count' ] = 0;
      }

      for (let i = 0; i < this.numOfAnnotations; i++) {
        const verse = res[ i ].passage.split(':');
        const bVerses = verse[ 1 ];
        const bVerse = bVerses.split(',');
        let profileImage = '';
        this._user.getDataFromID(res[ i ].creatorID).take(1).subscribe((userData) => {

          profileImage = userData[ 'data' ][ 'profileImage' ];

          // console.log(bVerse);

          for (let j = 0; j < bVerse.length; j++) {
            const index = bVerse[ j ] - 1;
            this.underlinedVerses[ index ] = true;
            this.countVerses[ index ][ 'count' ] += 1;
            if (this.countVerses[ index ][ 'images' ].length < 2) {
              this.countVerses[ index ][ 'images' ].push(profileImage);
            }
          }
        });
      }
    });

  }

  updatePost() {
    this.createPost.htmlText = this.createPost.text;
    this._study.updatePost(this.groupID, this.editingPostID, this.createPost).then(() => {
      this.resetPost();
      this.resetPosts = true;
      if (this.type === 'all') {
        this.getPosts();
      } else {
        this.switchTab(this.type + 's', true);
      }
      this.editingPostID = '';
      this.editing = false;
      this.toastr.show('Successfully Edited Post');
      this.toggleCreation(false);
      this.actionsExpanded = false;
    });
  }

  replyToPost(text: string, postID: string) {
    const reply = new Reply(text,
      this._user.userID.getValue(),
      Math.round((new Date()).getTime() / 1000),
      [],
      []);
    this._study.addPostReply(postID, this.groupID, reply).then(() => {
      this.toastr.show('Successfully Created Reply', 'Created Reply');
    });
  }

  replyToAnnotation(text: string, annotationID: string) {
    const reply = new Reply(text,
      this._user.userID.getValue(),
      Math.round((new Date()).getTime() / 1000),
      [],
      []);
    this._study.addAnnotationReply(annotationID, this.groupID, this.chapterRef, reply).then(() => {
      this.toastr.show('Successfully Created Reply', 'Created Reply');
    });
  }

  deleteAnnotation(value: boolean, annotationID: string,
    creatorID: string, isLeader: boolean) {
    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this._study.deleteAnnotation(this.groupID, this.chapterRef, annotationID).then(() => {
        this.toastr.show('Successfully Deleted Annotation', 'Deleted Annotation');
      });
    }
  }

  getChapter(book, chapter) {
    this.isLoading.next(true);
    this.underlinedVerses = [];
    this.countVerses = [];
    this.chapterSubscription = this._search.getChapter(book, chapter).take(1).pipe(
      pluck('data'),
      map(val => val[ 0 ])
    ).subscribe((res) => {
      this.bibleData = res;
      this.bibleData[ 'verse_data' ].forEach(() => {
        this.countVerses.push({ 'images': [], 'count': 0 });
        this.underlinedVerses.push(false);
        this.darkenedVerses.push(false);
      });
      this.numChapters = this.bibleData[ 'chapters' ].length;
      this.isLoading.next(false);
      this.getAnnotationsForChapter();
    });
    this.chapterRef = this.activeBook.toLowerCase() + '-' + this.activeChapter;

  }

  nextChapter() {
    if (this.activeChapter !== (this.bibleData[ 'chapters' ]).length) {
      this.activeChapter += 1;
      this.getChapter(this.activeBook, this.activeChapter);
    }
  }

  previousChapter() {
    if (this.activeChapter !== 1) {
      this.activeChapter -= 1;
      this.getChapter(this.activeBook, this.activeChapter);
    }
  }

  reformatPassage(value) {
    const allVerses = value.split(':')[ 1 ].split(',');
    const verseNumbers = [];
    allVerses.forEach((verseNumber) => {
      verseNumbers.push(Number(verseNumber));
    });
    this.underlinedVerses.forEach((val, index) => {
      if (verseNumbers.indexOf(index + 1) === -1) {
        this.underlinedVerses[ index ] = false;
      } else {
        this.underlinedVerses[ index ] = true;
      }
    });
    this.createAnnotation.passage = this._study.formatAnnotations(value);
  }

  prepareAnnotation() {
    this.createAnnotation.passage = `${ this.capitalize(this.activeBook) } ${ this.activeChapter }:`;
    let finishedFirst = false;
    this.underlinedVerses.forEach((isUnderlined, index) => {
      if (isUnderlined) {
        if (!finishedFirst) {
          this.createAnnotation.passage += this.bibleData[ 'verse_data' ][ index ][ 'verse_number' ];
          finishedFirst = true;
        } else {
          this.createAnnotation.passage += ',' + this.bibleData[ 'verse_data' ][ index ][ 'verse_number' ];
        }
      }
    });
    this.reformatPassage(this.createAnnotation.passage);
  }

  toggleVisibleLinks() {
    this.isVisibleLinks = !this.isVisibleLinks;
  }

  toggleVisibleVerses() {
    this.isVisibleVerses = !this.isVisibleVerses;
  }
}



