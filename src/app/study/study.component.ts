import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudyDataService } from '../study-data.service';
import { UserDataService } from '../user-data.service';
import { Post } from '../interfaces/post';
import { ToastrService } from 'ngx-toastr';
import * as firebase from 'firebase';
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
  name = '';
  posts;
  members = [];
  studyData;
  keyAnnouncements = [];
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
    this.getPosts();
    this.getMembers();
    this.getKeyAnnouncements();
  }

  resetPost() {
    this.createPost = new Post();
  }

  setPostType(type: string) {
    this.createPost.type = type;
    this.toggleCreation(true);
  }
  getAnnouncements() {
    this.posts = this._study.getPostByType(this.groupID, 'announcement');
  }

  getQuestions() {
    this.posts = this._study.getPostByType(this.groupID, 'question');
  }
  getDiscussions() {
    this.posts = this._study.getPostByType(this.groupID, 'discussion');
  }

  getPosts() {
    this.posts = this._study.getPosts(this.groupID);
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

}
