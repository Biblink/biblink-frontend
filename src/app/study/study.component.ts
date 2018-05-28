import { SearchService } from './../search.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudyDataService } from '../study-data.service';
import { UserDataService } from '../user-data.service';
import { Post } from '../interfaces/post';
import { ToastrService } from 'ngx-toastr';
import * as firebase from 'firebase';
import { Reply } from '../interfaces/reply';
import { Observable } from 'rxjs/Observable';
declare const $: any;
@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: [ './study.component.css' ]
})

export class StudyComponent implements OnInit {
  title = '';
  profileImage = '';
  bibleData = {};
  numChapters = 50;
  books = [];
  activeBook = 'Genesis';
  activeChapter = 1;
  numberOfMembers = 3;
  currentTab = 'feed';
  actionsExpanded = false;
  creationExpanded = false;
  createPost = new Post();
  postLength = 0;
  type = 'all';
  editing = false;
  resetPosts = false;
  editingPostID = '';
  name = '';
  private _posts = new BehaviorSubject([]);
  posts: Observable<any>;
  postIndices = [];
  members = [];
  studyData;
  keyAnnouncements = [];
  isLeader = false;
  isLoading = new BehaviorSubject<boolean>(true);
  isDone = false;
  userID = '';
  groupID = '';
  constructor(private _router: Router,
    private _search: SearchService,
    private _study: StudyDataService,
    private _user: UserDataService,
    private toastr: ToastrService) {

  }

  ngOnInit() {
    this._search.getBooks().subscribe((res) => {
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
    this._user.userData.subscribe((user) => {
      if (user !== null) {
        this.profileImage = user.data.profileImage;
        this.name = user.name;
      }
    });
    this.groupID = this._router.url.split('/').pop();
    this._study.getStudyData(this.groupID).subscribe((data) => {
      this.title = data[ 'name' ];
      this.studyData = data;
    });
    this._user.userID.subscribe((res) => {
      if (res !== '') {
        this.userID = res;
        this._study.getMemberData(this.groupID, res).subscribe((response) => {
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
    this.posts = this._posts.asObservable()
      .scan((acc, val) => {
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
        if (val.length === 0) {
          this.isDone = true;
          this.isLoading.next(false);
        }
        val.forEach((post) => {
          const index = this.postIndices.indexOf(post[ 'id' ]);
          if (index !== -1) {
            this.postIndices[ index ] = post[ 'id' ];
            acc[ index ] = post;
          } else {
            this.postIndices.push(post[ 'id' ]);
            valid.push(post);
          }
        });
        this.isLoading.next(false);
        this.postLength = acc.length + valid.length;
        return acc.concat(valid);
      });
    // this._study.updatePost(this.groupID);
  }

  resetPost() {
    this.createPost = new Post();
  }

  setPostType(type: string) {
    this.createPost.type = type;
    this.toggleCreation(true);
  }
  getAnnouncements() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._study.getPostByType(this.groupID, 'announcement').subscribe((res) => {
      const edited = [];
      res.forEach((val) => {
        if (val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '') {
          val[ 'htmlText' ] = val[ 'text' ];
        }
        edited.push(val);
      });
      this._posts.next(edited);
    });
    this.type = 'announcement';
  }

  getQuestions() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._study.getPostByType(this.groupID, 'question').subscribe((res) => {
      const edited = [];
      res.forEach((val) => {
        if (val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '') {
          val[ 'htmlText' ] = val[ 'text' ];
        }
        edited.push(val);
      });
      this._posts.next(edited);
    });
    this.type = 'question';
  }
  getDiscussions() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._study.getPostByType(this.groupID, 'discussion').subscribe((res) => {
      const edited = [];
      res.forEach((val) => {
        if (val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '') {
          val[ 'htmlText' ] = val[ 'text' ];
        }
        edited.push(val);
      });
      this._posts.next(edited);
    });
    this.type = 'discussion';
  }

  getPosts(limit = 10) {
    this.resetPosts = true;
    this.isLoading.next(true);
    this._study.getPosts(this.groupID, '', limit).subscribe((res) => {
      const edited = [];
      res.forEach((val) => {
        if (val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '') {
          val[ 'htmlText' ] = val[ 'text' ];
        }
        edited.push(val);
      });
      this._posts.next(edited);
    });
    this.type = 'all';
  }

  getMorePosts(timestamp: string, limit = 10) {
    if (this.isDone) {
      return;
    }
    this.isLoading.next(true);
    setTimeout(() => {
      if (this.type === 'all') {
        this._study.getPosts(this.groupID, timestamp, limit).subscribe((res) => {
          const edited = [];
          res.forEach((val) => {
            if (val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '') {
              val[ 'htmlText' ] = val[ 'text' ];
              edited.push(val);
            }
          });
          this._posts.next(res);
        });
      } else {
        this._study.getPostByType(this.groupID, this.type, timestamp, limit).subscribe((res) => {
          const edited = [];
          res.forEach((val) => {
            if (val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === '') {
              val[ 'htmlText' ] = val[ 'text' ];
              edited.push(val);
            }
          });
          this._posts.next(res);
        });
      }
    }, 1000);
  }
  getKeyAnnouncements() {
    this._study.getKeyAnnouncements(this.groupID).subscribe((announcements) => {
      this.keyAnnouncements = [];
      announcements.forEach((announcement) => {
        if (announcement[ 'htmlText' ] === undefined || announcement[ 'htmlText' ] === '') {
          announcement[ 'htmlText' ] = announcement[ 'text' ];
        }
        let firstTime = false;
        let oldData = {};
        this._user.getDataFromID(announcement[ 'creatorID' ]).subscribe((res) => {
          announcement[ 'image' ] = res[ 'data' ][ 'profileImage' ];
          if (firstTime) {
            this.keyAnnouncements[ this.keyAnnouncements.indexOf(oldData) ] = announcement;
          } else {
            this.keyAnnouncements.push(announcement);
          }
          firstTime = true;
          oldData = announcement;
        });
      });
    });
  }

  getMembers() {
    this._study.getMembers(this.groupID).subscribe((members) => {
      this.members = [];
      members.forEach((member) => {
        let firstTime = false;
        let oldImage = { 'name': '', 'image': '' };
        this._user.getDataFromID(member[ 'uid' ]).subscribe((res) => {
          if (firstTime) {
            this.members[ this.members.indexOf(oldImage) ] = { 'name': res[ 'name' ], 'image': res[ 'data' ][ 'profileImage' ] };
          } else {
            this.members.push({ 'name': res[ 'name' ], 'image': res[ 'data' ][ 'profileImage' ] });
          }
          firstTime = true;
          oldImage = { 'name': res[ 'name' ], 'image': res[ 'data' ][ 'profileImage' ] };
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
      });
      jElement.hover(() => {
        if ($(`div#${ event.srcElement.id }~.verse-text-${ index }`).length !== 0) {
          const val = $('div#' + event.srcElement.id + `~div.verse-text-${ index }`);
          val.show();
          val.hover(() => {
            val.show();
          }, () => val.hide());
        } else {
          parentDiv.after(`
          <div class="verse-text-${index }">
            ${ verseText }
          </div>
          `);
        }
        textSubscriber.unsubscribe();
      }, () => {
        let hovering = false;
        const val = $('div#' + event.srcElement.id + `~div.verse-text-${ index }`);
        setTimeout(() => {
          if (hovering) {
            return;
          } else {
            val.hide();
          }
        }, 200);
        val.hover(() => {
          hovering = true;
          val.show();
        }, () => val.hide());
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
      const parentDiv = jElement.parent();
      const reference = jElement.text();
      let verseText = '';
      let addedText = false;
      const textSubscriber = this._search.getVerseText(reference).take(1).subscribe((res) => {
        verseText = res[ 'data' ][ 0 ][ 'combined_text' ];
        if (!addedText && reference.indexOf(': ') === -1) {
          jElement.html(reference + ': ' + verseText.replace(/<n[^>]*>([^<]+)<\/n>/g, ''));
          textSubscriber.unsubscribe();
        }
        addedText = true;
      });
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

  toggleCreation(value: boolean) {
    if (this.createPost.type === '' && this.creationExpanded === false) {
      this.createPost.type = 'post';
    }
    this.creationExpanded = value;
  }

  publishPost() {
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
      this._study.getPostByID(this.groupID, postID).subscribe((res) => {
        if (this.editing) {
          this.createPost = res as Post;
          this.editingPostID = postID;
          this.expandActions();
          this.toggleCreation(true);
        }
      });
    }
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
      [], // TODO: create verse extractor
      []); // TODO: create link extractor
    this._study.addReply(postID, this.groupID, reply).then(() => {
      this.toastr.show('Successfully Created Reply', 'Created Reply');
    });
  }

  getChapter(book, chapter) {
    this.isLoading.next(true);
    this._search.getChapter(book, chapter).subscribe((res) => {
      this.bibleData = res[ 'data' ][ 0 ];
      this.numChapters = this.bibleData[ 'chapters' ].length;
      this.isLoading.next(false);
    });
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

}
