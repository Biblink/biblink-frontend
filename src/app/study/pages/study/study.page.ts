import { trigger } from '@angular/animations';
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
import { Datum, Chapter } from '../../../core/interfaces/chapter';

/**
 * access to jquery instance
 */
declare let $: any;
/**
 * Study component to handle displaying of study page
 */
@Component({
  selector: 'app-study',
  templateUrl: './study.page.html',
  styleUrls: ['./study.page.css']
})
export class StudyComponent implements OnInit, OnDestroy {
  /**
   * @ignore
   */
  editPostSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  chapterAnnotationsSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  editAnnotationSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  getMorePostSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  chapterSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  membersSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  keyAnnouncementSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  postSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  roleSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  userIDSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  studyDataSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  userDataSubscription: Subscription = new Subscription();
  /**
   * @ignore
   */
  searchSubscription: Subscription = new Subscription();
  /**
   * Title of page
   */
  title = 'default';
  /**
   * Unique ID of group
   */
  groupUniqueID = 'default';
  /**
   * Current chapter reference
   */
  chapterRef = 'default';
  /**
   * Current user's profile image URL
   */
  profileImage = 'default';
  /**
   * Current Bible chapter data
   */
  bibleData: Datum;
  /**
   * List of underlined verses for a chapter
   */
  underlinedVerses = [];
  /**
   * List of darkened verses for a chapter
   */
  darkenedVerses = [];
  /**
   * Counts of annotations for all verses of a chapter
   */
  countVerses = [];
  /**
   * Number of chapters
   */
  numChapters = 50;
  /**
   * list of books of the Bible
   */
  books = [];
  /**
   * Current active book in shared Bible
   */
  activeBook = 'Genesis';
  /**
   * Current active chapter in shared Bible
   */
  activeChapter = 1;
  /**
   * Number of members to display in sidebar
   */
  numberOfMembers = 3;
  /**
   * Current tab to display
   */
  currentTab = 'feed';
  /**
   * Value to see whether or not action bar is expanded
   */
  actionsExpanded = false;
  /**
   * Value to see whether or not creation form is expanded
   */
  creationExpanded = false;
  /**
   * Variable to hold create post form values
   */
  createPost = new Post();
  /**
   * Variable to hold create annotation form values
   */
  createAnnotation = new Annotation();
  /**
   * Annotation sorting method
   */
  sortAnnotation = 'timestamp';
  /**
   * Number of posts
   */
  postLength = 1;
  /**
   * Post type to filter by
   */
  type = 'all';
  /**
   * Value to see if a user is editing a post
   */
  editing = false;
  /**
   * Value to see if a user is editing an annotation
   */
  editingAnnotation = false;
  /**
   * Value to see if posts should be reset
   */
  resetPosts = false;
  /**
   * Current editing post ID
   */
  editingPostID = 'default';
  /**
   * Current editing annotation ID
   */
  editingAnnotationID = 'default';
  /**
   * Name of study
   */
  name = 'default';
  /**
   * Observable of posts to be displayed
   */
  posts: Observable<any>;
  /**
   * Observable of annotations to be displayed
   */
  chapterAnnotations: Observable<any>;
  /**
   * The number of annotations for a chapter
   */
  numOfAnnotations = 1;
  /**
   * List of post indices for scrolling
   */
  postIndices = [];
  /**
   * List of members
   */
  members = [];
  /**
   * Study metadata
   */
  studyData;
  /**
   * List of key announcements
   */
  keyAnnouncements = [];
  /**
   * Value to hold settings tab
   */
  settingsTab = 'info';
  /**
   * Value to see if user is a leader
   */
  isLeader = false;
  /**
   * List of posts to be checked
   */
  private _posts = new BehaviorSubject([]);
  /**
   * Behavior Subject to handle loading state
   */
  isLoading = new BehaviorSubject<boolean>(true);
  /**
   * Whether or not loading is finished
   */
  isDone = false;
  /**
   * User ID
   */
  userID = 'default';
  /**
   * Group ID
   */
  groupID = 'default';
  /**
   * Value to see if user is currently getting more posts
   */
  isGettingMorePosts = false;

  /**
   * Value to see if promotion modal is activated
   */
  activatePromotionModal = false;
  /**
   * Current promote user
   */
  currentPromote: Object = { name: '', uid: '' };
  /**
   * Initializes necessary dependency and does dependency injection
   * @param {Router} _router Router dependency to access router for navigations
   * @param {Title} title Title dependency to change title of pages
   * @param {SearchService} searchService Search service dependency to get verse data
   * @param {StudyDataService} groupData Study data service dependency to get study data
   * @param {UserDataService} _data UserData service dependency to get user data
   * @param {ToastrService} toastr Toastr service to display notifications
   */
  constructor(
    private _router: Router,
    private _title: Title,
    private _search: SearchService,
    private _study: StudyDataService,
    private _user: UserDataService,
    private toastr: ToastrService
  ) { }

  /**
   * Destroys component and unsubscribes from all subscriptions
   */
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
  /**
   * Initializes component
   */
  ngOnInit() {
    this.searchSubscription = this._search.getBooks().subscribe(res => {
      this.books = res.data;
      this.books.forEach((book, index) => {
        const words = book.split(' ');
        const fixed = [];
        words.forEach(word => {
          if (word === 'of') {
            fixed.push(word);
          } else {
            fixed.push(this.capitalize(word));
          }
        });
        const fixedBook = fixed.join(' ');
        this.books[index] = fixedBook;
      });
    });
    this.userDataSubscription = this._user.userData.subscribe(user => {
      if (user !== null) {
        this.profileImage = user.data.profileImage;
        this.name = user.name;
      }
    });
    this.groupID = this._router.url.split('/').pop();
    if (this.groupID === '') {
      this.groupID = 'default';
    }
    this.studyDataSubscription = this._study
      .getStudyData(this.groupID)
      .subscribe(data => {
        this.title = data['name'];
        this._title.setTitle(this.title);
        this.groupUniqueID = data['uniqueID'];
        this.studyData = data;
      });
    this.userIDSubscription = this._user.userID.subscribe(res => {
      if (res !== '') {
        this.userID = res;
        this.roleSubscription = this._study
          .getMemberData(this.groupID, res)
          .subscribe(response => {
            if (response['role'] === 'leader') {
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
          val.forEach(post => {
            this.postIndices.push(post['id']);
          });
          this.isLoading.next(false);
          this.postLength = val.length;
          return (acc = val);
        }
        if (this.isDone) {
          this.isLoading.next(false);
          return acc;
        }
        const valid = [];
        val.forEach(post => {
          const index = this.postIndices.indexOf(post['id']);
          if (index !== -1) {
            this.postIndices[index] = post['id'];
            acc[index] = post;
          } else {
            if (this.isGettingMorePosts) {
              this.postIndices.push(post['id']);
            } else {
              this.postIndices.unshift(post['id']);
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
      })
    );
    // this._study.updatePost(this.groupID);
  }
  /**
   * Resets post form
   */
  resetPost() {
    this.createPost = new Post();
  }
  /**
   * Resets annotation form
   */
  resetAnnotation() {
    this.createAnnotation = new Annotation();
  }
  /**
   * Sets post type for post form
   * @param {string} type Post Type
   */
  setPostType(type: string) {
    this.createPost.type = type;
    this.toggleCreation(true);
  }
  /**
   * Sets annotation type for annotation form
   * @param {string} type Annotation Type
   */
  setAnnotationType(type: string) {
    this.createAnnotation.type = type;
    this.toggleCreation(true, true);
  }
  /**
   * Set data for promotion form
   * @param name Name of current promote
   * @param uid UID of current promote
   */
  verifyPromote(name: string, uid) {
    this.activatePromotionModal = true;
    this.currentPromote['name'] = name;
    this.currentPromote['uid'] = uid;
  }
  /**
   * Promote a user to leader
   */
  promoteToLeader() {
    if (
      this.currentPromote['name'] !== '' &&
      this.currentPromote['uid'] !== ''
    ) {
      if (this.isLeader) {
        this._study
          .promoteUser(this.currentPromote['uid'], this.groupID, 'leader')
          .then(() => {
            this.toastr.show(
              `Successfully Promoted ${this.currentPromote['name']} to Leader`,
              'Leader Promotion'
            );
          });
      }
    }
  }
  /**
   * Get study announcements
   */
  getAnnouncements() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('announcement');
    this.type = 'announcement';
  }
  /**
   * Get study questions
   */
  getQuestions() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('question');
    this.type = 'question';
  }
  /**
   * Get study discussions
   */
  getDiscussions() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('discussion');
    this.type = 'discussion';
  }
  /**
   * Get posts by a specific type
   */
  private _getFeedByType(type: string): void {
    this.postSubscription = this._study
      .getPostByType(this.groupID, type)
      .pipe(
        map(res => {
          res.map(val => this._checkHtmlText(val));
          return res;
        })
      )
      .subscribe(res => {
        this._posts.next(res);
      });
  }
  /**
   * Get all posts
   * @param limit Max amount of posts to return
   */
  getPosts(limit = 10) {
    this.resetPosts = true;
    this.isLoading.next(true);
    this.postSubscription = this._study
      .getPosts(this.groupID, '', limit)
      .pipe(
        map(res => {
          res.map(val => this._checkHtmlText(val));
          return res;
        })
      )
      .subscribe(res => {
        this._posts.next(res);
      });
    this.type = 'all';
  }
  /**
   * Get more posts of a specific type
   * @param timestamp Timestamp start point
   * @param limit Max amount of posts to return
   */
  getMorePosts(timestamp: string, limit = 10) {
    this.isGettingMorePosts = true;
    if (this.isDone) {
      return;
    }
    this.isLoading.next(true);
    setTimeout(() => {
      if (this.type === 'all') {
        this.getMorePostSubscription = this._study
          .getPosts(this.groupID, timestamp, limit)
          .pipe(
            map(res => {
              res.map(val => this._checkHtmlText(val));
              return res;
            })
          )
          .subscribe(res => {
            this._posts.next(res);
          });
      } else {
        this.getMorePostSubscription = this._study
          .getPostByType(this.groupID, this.type, timestamp, limit)
          .pipe(
            map(res => {
              res.map(val => this._checkHtmlText(val));
              return res;
            })
          )
          .subscribe(res => {
            this._posts.next(res);
          });
      }
    }, 1000);
  }
  /**
   * Checks if htmlText property is present
   */
  private _checkHtmlText(val: any) {
    val['htmlText'] =
      val['htmlText'] === undefined || val['htmlText'] === ''
        ? val['text']
        : val['htmlText'];
    return val;
  }
  /**
   * Gets key announcements (three most recent announcements)
   */
  getKeyAnnouncements() {
    this.keyAnnouncementSubscription = this._study
      .getKeyAnnouncements(this.groupID)
      .pipe(
        map(res => {
          this.keyAnnouncements = [];
          res.map(val => {
            val = this._checkHtmlText(val);
            const contained = this.keyAnnouncements.filter(
              value => value['id'] === val['id']
            );
            this._user
              .getDataFromID(val['creatorID'])
              .take(1)
              .subscribe(response => {
                val['image'] = response['data']['profileImage'];
                if (contained.length === 1) {
                  this.keyAnnouncements[
                    this.keyAnnouncements.indexOf(contained[0])
                  ] = val;
                } else {
                  this.keyAnnouncements.push(val);
                }
              });
          });
          return res;
        })
      )
      .subscribe();
  }
  /**
   * Gets all members of a study
   */
  getMembers() {
    this.membersSubscription = this._study
      .getMembers(this.groupID)
      .subscribe(members => {
        this.members = [];
        members.forEach(member => {
          let firstTime = false;
          let oldImage = { name: '', uid: '', image: '', role: '' };
          this._user.getDataFromID(member['uid']).subscribe(res => {
            if (firstTime) {
              this.members[this.members.indexOf(oldImage)] = {
                name: res['name'],
                image: res['data']['profileImage'],
                role: member['role'],
                uid: member['uid']
              };
            } else {
              this.members.push({
                name: res['name'],
                uid: member['uid'],
                image: res['data']['profileImage'],
                role: member['role']
              });
            }
            firstTime = true;
            oldImage = {
              name: res['name'],
              uid: member['uid'],
              image: res['data']['profileImage'],
              role: member['role']
            };
          });
        });
      });
  }
  /**
   * Navigates to a particular URL
   * @param {string} url Url to navigate to
   */
  navigateTo(url) {
    this._router.navigateByUrl(url);
  }
  /**
   * Gets a verse based on a fired event
   * @param {any} event Element source (Source of the fired event)
   */
  getVerse(event) {
    const spans = $('div#' + event.srcElement.id + '.card-body span');
    spans.each((index, el) => {
      const jElement = $(el);
      const parentDiv = jElement.parent();
      const reference = jElement.text();
      let verseText = '';
      const textSubscriber = this._search
        .getVerseText(reference)
        .take(1)
        .subscribe(res => {
          verseText = res.data[0].combined_text;
          jElement.attr('data-tooltip', verseText.replace(/<\/?n>/g, ''));
          jElement.addClass('tooltip is-tooltip-bottom is-tooltip-multiline');
        });

      jElement.click(() => {
        this._router.navigateByUrl(`/search?query=${reference}`);
      });
    });
  }
  /**
   * Sets verse links to search page
   * @param {any} event Element source (Source of fired event)
   */
  getVerseLinks(event) {
    const spans = $('div#' + event.srcElement.id + ' .verse-container span');
    spans.each((index, el) => {
      const jElement = $(el);
      const reference = jElement.text();
      jElement.click(() => {
        this._router.navigateByUrl(`/search?query=${reference.split(': ')[0]}`);
      });
    });
  }
  /**
   * Switch to a certain tab
   * @param {string} val Tab to switch to
   * @param {boolean} override Whether or not to override current tab check
   */
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
        this.getChapter('Genesis', 1);
      }
    }
  }
  /**
   * Logs user out
   */
  logout() {
    this._user.logout().then(() => {
      this.navigateTo('/sign-in');
      localStorage.removeItem('user');
    });
  }
  /**
   * Expands action bar
   */
  expandActions() {
    this.actionsExpanded = true;
  }
  /**
   * Toggles creation form
   * @param {bboolean} whether or not to expand creation
   * @param {annotation} whether or not user is creating an annotation
   */
  toggleCreation(value: boolean, annotation = false) {
    if (annotation) {
      if (
        this.createAnnotation.type === '' &&
        this.creationExpanded === false
      ) {
        this.createAnnotation.type = 'note';
      }
    } else {
      if (this.createPost.type === '' && this.creationExpanded === false) {
        this.createPost.type = 'post';
      }
    }
    this.creationExpanded = value;
  }
  /**
   * Publishes a post
   */
  publishPost() {
    if (this.currentTab === 'shared-bible') {
      this.publishAnnotation();
      return;
    }
    if (this.editing) {
      return this.updatePost();
    }
    const today = new Date();
    const date = `${today.getMonth() +
      1}/${today.getDate()}/${today.getFullYear()}`;
    const time = today.toLocaleTimeString();
    const postType = this.capitalize(this.createPost.type);
    this.createPost.dateInfo = { date: date, time: time };
    this.createPost.timestamp = Math.round(new Date().getTime() / 1000);
    this.createPost.creatorID = this._user.userID.getValue();
    this.createPost.contributors.push(this.createPost.creatorID);
    this._study.createPost(this.groupID, this.createPost).then(() => {
      this.toastr.show(
        'Successfully Created Your ' + postType,
        'Successful Creation of ' + postType
      );
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
  /**
   * Publishes an annotation
   */
  publishAnnotation() {
    if (this.editing) {
      return this.updateAnnotation();
    }

    this.createAnnotation.chapterReference = `${this.activeBook.toLowerCase()}-${
      this.activeChapter
      }`;
    const today = new Date();
    const date = `${today.getMonth() +
      1}/${today.getDate()}/${today.getFullYear()}`;
    const time = today.toLocaleTimeString();
    const annotationType = this.capitalize(this.createAnnotation.type);
    const verseList = this._study.formatAnnotations(
      this.createAnnotation.passage,
      true
    );
    this.createAnnotation.verse_search = Math.min(...verseList);
    this.createAnnotation.dateInfo = { date: date, time: time };
    this.createAnnotation.timestamp = Math.round(new Date().getTime() / 1000);
    this.createAnnotation.creatorID = this._user.userID.getValue();
    this._study
      .createAnnotation(
        this.groupID,
        this.createAnnotation.chapterReference,
        this.createAnnotation
      )
      .then(() => {
        this.toastr.show(
          'Successfully Created Your ' + annotationType,
          'Successful Creation of ' + annotationType
        );
        this.resetAnnotation();
        this.toggleCreation(false);
      });
  }
  /**
   * Updates an annotation
   */
  updateAnnotation() {
    this.createAnnotation.htmlText = this.createAnnotation.text;
    this._study
      .updateAnnotation(
        this.groupID,
        this.chapterRef,
        this.editingAnnotationID,
        this.createAnnotation
      )
      .then(() => {
        this.resetAnnotation();
        this.editingAnnotationID = '';
        this.editingAnnotation = false;
        this.editing = false;
        this.toastr.show('Successfully Edited Annotation');
        this.toggleCreation(false);
        this.actionsExpanded = false;
      });
  }
  /**
   * Capitalizes a string
   * @param {string} str String to capitalize
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }
  /**
   * Check if a value exists
   * @param {any} value Value to check
   */
  checkIfExists(value) {
    return (
      value === undefined ||
      value === null ||
      value === [] ||
      value === {} ||
      Object.keys(value).length === 0
    );
  }

  /**
   * Deletes post if user is a leader or is creator of post
   * @param {boolean} value Whether or not to delete
   * @param {string} postID Post ID
   * @param {string} creatorID Creator ID
   * @param {boolean} isLeader Whether or not user is a leader
   */
  deletePost(
    value: boolean,
    postID: string,
    creatorID: string,
    isLeader: boolean
  ) {
    this.resetPosts = true;

    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this._study.deletePost(this.groupID, postID).then(() => {
        this.toastr.show('Successfully Deleted Post');
      });
    }
  }
  /**
   * Edits post if user is a leader or is creator of post
   * @param {boolean} value Whether or not to delete
   * @param {string} postID Post ID
   * @param {string} creatorID Creator ID
   * @param {boolean} isLeader Whether or not user is a leader
   */
  editPost(
    value: boolean,
    postID: string,
    creatorID: string,
    isLeader: boolean
  ) {
    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this.editing = true;
      this.editPostSubscription = this._study
        .getPostByID(this.groupID, postID)
        .subscribe(res => {
          if (this.editing) {
            this.createPost = res as Post;
            this.editingPostID = postID;
            this.expandActions();
            this.toggleCreation(true);
          }
        });
    }
  }
  /**
   * Edits annotation if user is a leader or is creator of annotation
   * @param {boolean} value Whether or not to delete
   * @param {string} annotationID Annotation ID
   * @param {string} creatorID Creator ID
   * @param {boolean} isLeader Whether or not user is a leader
   */
  editAnnotation(
    value: boolean,
    annotationID: string,
    creatorID: string,
    isLeader: boolean
  ) {
    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this.editing = true;
      this.editingAnnotation = true;

      this.editAnnotationSubscription = this._study
        .getAnnotationByID(
          this.groupID,
          `${this.activeBook.toLowerCase()}-${this.activeChapter}`,
          annotationID
        )
        .subscribe(res => {
          if (this.editing) {
            this.createAnnotation = res as Annotation;
            this.editingAnnotationID = annotationID;
            this.expandActions();
            this.toggleCreation(true);
          }
        });
    }
  }
  /**
   * Gets all annotation for current (active book){@link StudyComponent#activeBook} and (active chapter){@link StudyComponent#activeChapter}
   */
  getAnnotationsForChapter() {
    const chapterReference = `${this.activeBook.toLowerCase()}-${
      this.activeChapter
      }`;
    this.chapterAnnotations = this._study.getAnnotationsByChapterReference(
      this.groupID,
      chapterReference,
      this.sortAnnotation
    );
    this.chapterAnnotationsSubscription = this.chapterAnnotations.subscribe(
      res => {
        this.numOfAnnotations = res.length;
        const countForAnnotations = [];
        const indexOfVerse = [];

        for (let j = 0; j < this.underlinedVerses.length; j++) {
          this.countVerses[j]['images'] = [];
          this.countVerses[j]['count'] = 0;
        }

        for (let i = 0; i < this.numOfAnnotations; i++) {
          const bVerse = this._study.formatAnnotations(res[i].passage, true);
          const verse_search = Math.min(...bVerse);
          if (res[i].verse_search === undefined) {
            this._study.addSearchAttrToAnnotation(
              this.groupID,
              this.chapterRef,
              res[i].id,
              verse_search
            );
            res[i].verse_search = verse_search;
          }
          let profileImage = '';
          this._user
            .getDataFromID(res[i].creatorID)
            .take(1)
            .subscribe(userData => {
              profileImage = userData['data']['profileImage'];
              for (let z = 0; z < bVerse.length; z++) {
                const index = bVerse[z] - 1;
                this.underlinedVerses[index] = true;
                this.countVerses[index]['count'] += 1;
                if (
                  this.countVerses[index]['images'].length < 2 &&
                  this.countVerses[index]['images'].indexOf(profileImage) === -1
                ) {
                  this.countVerses[index]['images'].push(profileImage);
                }
              }
            });
        }
      }
    );
  }
  /**
   * Updates a post with current form data
   */
  updatePost() {
    this.createPost.htmlText = this.createPost.text;
    this._study
      .updatePost(this.groupID, this.editingPostID, this.createPost)
      .then(() => {
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
  /**
   * Replies to a post
   * @param {string} text Reply Text
   * @param {string} postID Post ID
   */
  replyToPost(text: string, postID: string) {
    const reply = new Reply(
      text,
      this._user.userID.getValue(),
      Math.round(new Date().getTime() / 1000),
      [],
      []
    );
    this._study.addPostReply(postID, this.groupID, reply).then(() => {
      this.toastr.show('Successfully Created Reply', 'Created Reply');
    });
  }
  /**
   * Replies to an annotation
   * @param {string} text Reply Text
   * @param {string} annotationID Annotation ID
   */
  replyToAnnotation(text: string, annotationID: string) {
    const reply = new Reply(
      text,
      this._user.userID.getValue(),
      Math.round(new Date().getTime() / 1000),
      [],
      []
    );
    this._study
      .addAnnotationReply(annotationID, this.groupID, this.chapterRef, reply)
      .then(() => {
        this.toastr.show('Successfully Created Reply', 'Created Reply');
      });
  }
  /**
   * Deletes annotation if user is leader or is creator
   * @param {boolean} value Whether or not to delete annotation
   * @param {string} annotationID Annotation ID
   * @param {string} creatorID Creator ID
   * @param {boolean} isLeader Whether or not user is leader
   */
  deleteAnnotation(
    value: boolean,
    annotationID: string,
    creatorID: string,
    isLeader: boolean
  ) {
    if (value && (creatorID === this._user.userID.getValue() || isLeader)) {
      this._study
        .deleteAnnotation(this.groupID, this.chapterRef, annotationID)
        .then(() => {
          this.toastr.show(
            'Successfully Deleted Annotation',
            'Deleted Annotation'
          );
        });
    }
  }
  /**
   * Gets verses of a chapter
   * @param {string} book Book name
   * @param {number} chapter Chapter number
   */
  getChapter(book, chapter: number) {
    this.isLoading.next(true);
    this.underlinedVerses = [];
    this.countVerses = [];
    this.chapterSubscription = this._search
      .getChapter(book, chapter)
      .take(1)
      .pipe(
        pluck('data'),
        map(val => val[0])
      )
      .subscribe((res: Datum) => {
        this.bibleData = res;
        this.bibleData.verse_data.forEach(() => {
          this.countVerses.push({ images: [], count: 0 });
          this.underlinedVerses.push(false);
          this.darkenedVerses.push(false);
        });
        this.numChapters = this.bibleData.chapters.length;
        this.isLoading.next(false);
        this.getAnnotationsForChapter();
      });
    this.chapterRef = this.activeBook.toLowerCase() + '-' + this.activeChapter;
  }
  /**
   * Gets next chapter
   */
  nextChapter() {
    if (this.activeChapter !== this.bibleData.chapters.length) {
      this.activeChapter += 1;
      this.getChapter(this.activeBook, this.activeChapter);
    }
  }
  /**
   * Gets previous chapter
   */
  previousChapter() {
    if (this.activeChapter !== 1) {
      this.activeChapter -= 1;
      this.getChapter(this.activeBook, this.activeChapter);
    }
  }
  /**
   * Reformats a passage given a verse reference
   * @param {string} value Verse REference
   */
  reformatPassage(value: string) {
    const allVerses = this._study.formatAnnotations(value, true);
    const verseNumbers = [];
    allVerses.forEach(verseNumber => {
      verseNumbers.push(Number(verseNumber));
    });

    this.underlinedVerses.forEach((val, index) => {
      if (
        verseNumbers.indexOf(index + 1) === -1 &&
        this.countVerses[index].count === 0
      ) {
        this.underlinedVerses[index] = false;
      } else {
        this.underlinedVerses[index] = true;
      }
    });
    if (this.createAnnotation.passage.split(':').pop() === '') {
      this.createAnnotation.passage = '';
    } else {
      this.createAnnotation.passage = this._study.formatAnnotations(value);
    }
  }
  /**
   * Prepares an annotation to be published
   */
  prepareAnnotation() {
    this.createAnnotation.passage = `${this.capitalize(this.activeBook)} ${
      this.activeChapter
      }:`;
    let finishedFirst = false;
    this.underlinedVerses.forEach((isUnderlined, index) => {
      if (
        (isUnderlined && this.countVerses[index].count === 0) ||
        (isUnderlined && this.darkenedVerses[index])
      ) {
        if (!finishedFirst) {
          this.createAnnotation.passage += this.bibleData.verse_data[
            index
          ].verse_number;
          finishedFirst = true;
        } else {
          this.createAnnotation.passage +=
            ',' + this.bibleData.verse_data[index].verse_number;
        }
      }
    });
    this.reformatPassage(this.createAnnotation.passage);
  }
  /**
   * Switches settings tab
   * @param {'info' | 'roles'} value Tab to change to
   */
  switchSettingsTab(value: 'info' | 'roles') {
    this.settingsTab = value;
  }
}
