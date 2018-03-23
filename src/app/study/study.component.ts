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
@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: [ './study.component.css' ]
})
export class StudyComponent implements OnInit {
  title = '';
  profileImage = '';
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
  isLoading = false;
  isDone = false;
  userID = '';
  groupID = '';
  constructor(private _router: Router, private _study: StudyDataService, private _user: UserDataService, private toastr: ToastrService) {

  }

  ngOnInit() {
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
          this.isLoading = false;
          this.postLength = val.length;
          return acc = val;
        }
        if (this.isDone) {
          this.isLoading = false;
          return acc;
        }
        const valid = [];
        if (val.length === 0) {
          this.isDone = true;
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
        this.isLoading = false;
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
    this.isLoading = true;
    this.resetPosts = true;
    this._study.getPostByType(this.groupID, 'announcement').subscribe((res) => {
      this._posts.next(res);
    });
    this.type = 'announcement';
  }

  getQuestions() {
    this.isLoading = true;
    this.resetPosts = true;
    this._study.getPostByType(this.groupID, 'question').subscribe((res) => {
      this._posts.next(res);
    });
    this.type = 'question';
  }
  getDiscussions() {
    this.isLoading = true;
    this.resetPosts = true;
    this._study.getPostByType(this.groupID, 'discussion').subscribe((res) => {
      this._posts.next(res);
    });
    this.type = 'discussion';
  }

  getPosts(limit = 4) {
    this.resetPosts = true;
    this.isLoading = true;
    this._study.getPosts(this.groupID, '', 4).subscribe((res) => {
      console.log(res);
      this._posts.next(res);
    });
    this.type = 'all';
  }

  getMorePosts(timestamp: string, limit = 4) {
    if (this.isDone) {
      return;
    }
    if (this.type === 'all') {
      this.isLoading = true;
      this._study.getPosts(this.groupID, timestamp, limit).subscribe((res) => {
        this._posts.next(res);
      });
    } else {
      this.isLoading = true;
      this._study.getPostByType(this.groupID, this.type, timestamp, limit).subscribe((res) => {
        this._posts.next(res);
      });
    }
  }
  getKeyAnnouncements() {
    this._study.getKeyAnnouncements(this.groupID).subscribe((announcements) => {
      this.keyAnnouncements = [];
      announcements.forEach((announcement) => {
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

  switchTab(val, override = false) {
    if (this.currentTab === val && !override) {
      return;
    }
    this.currentTab = val;
    switch (this.currentTab) {
      case 'feed': {
        this.getPosts();
        break;
      }
      case 'announcements': {
        this.getAnnouncements();
        break;
      }
      case 'questions': {
        this.getQuestions();
        break;
      }
      case 'discussions': {
        this.getDiscussions();
        break;
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

}
