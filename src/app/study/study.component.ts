import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudyDataService } from '../study-data.service';
import { UserDataService } from '../user-data.service';
import { Post } from '../interfaces/post';
import { ToastrService } from 'ngx-toastr';
import * as firebase from 'firebase';
import { Reply } from '../interfaces/reply';
import { PaginationService } from '../pagination.service';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: [ './study.component.css' ]
})
export class StudyComponent implements OnInit {
  title = '';
  profileImage = '';
  currentTab = 'feed';
  actionsExpanded = false;
  creationExpanded = false;
  createPost = new Post();
  editing = false;
  editingPostID = '';
  name = '';
  posts;
  members = [];
  studyData;
  keyAnnouncements = [];
  isLeader = false;
  userID = '';
  groupID = '';
  constructor(private _router: Router, public page: PaginationService,
    private _study: StudyDataService, private _user: UserDataService, private toastr: ToastrService) {

  }

  ngOnInit() {
    const init = [];
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
    this.page.init(this.groupID, 'posts', 'timestamp', { limit: 4, reverse: true });
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
    this.getMembers();
    this.getKeyAnnouncements();
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
    this.page.init(this.groupID, 'posts', 'timestamp', { type: 'announcement', limit: 4, reverse: true });

  }

  getQuestions() {
    this.page.init(this.groupID, 'posts', 'timestamp', { type: 'question', limit: 4, reverse: true });
  }
  getDiscussions() {
    this.page.init(this.groupID, 'posts', 'timestamp', { type: 'discussion', limit: 4, reverse: true });
  }

  getPosts() {
    this.page.init(this.groupID, 'posts', 'timestamp', { limit: 4, reverse: true });
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

  switchTab(val) {
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
    console.log(`Date: ${ date }, Time: ${ time }`);
    this.createPost.dateInfo = { date: date, time: time };
    this.createPost.timestamp = Math.round((new Date()).getTime() / 1000);
    this.createPost.creatorID = this._user.userID.getValue();
    this.createPost.contributors.push(this.createPost.creatorID);
    this._study.createPost(this.groupID, this.createPost).then(() => {
      this.toastr.show('Successfully Created Your ' + postType,
        'Successful Creation of ' + postType);
      this.resetPost();
      this.toggleCreation(false);
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
        this.createPost = res as Post;
        this.editingPostID = postID;
        this.expandActions();
        this.toggleCreation(true);
      });
    }
  }

  updatePost() {
    this._study.updatePost(this.groupID, this.editingPostID, this.createPost).then(() => {
      this.resetPost();
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

  scrollHandler(e) {
    if (e === 'bottom') {
      this.page.more();
    }
  }
}
