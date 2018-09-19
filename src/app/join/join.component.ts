import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { StudyDataService } from '../study/services/study-data.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs';
import { UserDataService } from '../core/services/user-data/user-data.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit, OnDestroy {
  isLoading = new BehaviorSubject<boolean>(true);
  showResults = false;
  authStateSubscription: Subscription;
  routeSubscription: Subscription;
  studySubscription: Subscription;
  study: any;
  info = '';
  studySearchName = '';
  studyUniqueID = 0;
  isLoggedIn = false;
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _auth: AuthService,
    private _user: UserDataService,
    private _study: StudyDataService
  ) { }

  ngOnInit() {
    this.authStateSubscription = this._auth.authState.subscribe(res => {
      if (res !== undefined) {
        if (res === null) {
          this.isLoggedIn = false;
        } else {
          this.isLoggedIn = true;
        }
      }
    });
    this.routeSubscription = this._route.queryParams.subscribe(param => {
      if (param[ 'info' ] !== undefined) {
        this.info = param[ 'info' ];
        const splitInfo = this.info.split(';');
        this.studySearchName = splitInfo[0];
        this.studyUniqueID = +splitInfo[1];
        this.studySubscription = this.getStudy(splitInfo[0], +splitInfo[1]).subscribe(value => {
          this.study = value[0];
          this.showResults = true;
          this.isLoading.next(false);
        });
      } else {
        this._router.navigateByUrl('/');
      }
    });
  }


  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.studySubscription.unsubscribe();
  }

  getStudy(searchName, uniqueID) {
    return this._study.getStudyBySearchName(searchName, uniqueID);
  }

  goToSignUp() {
    this._router.navigateByUrl(`/get-started?redirect=join&info=${ this.info}`);
  }
  goToSignIn() {
    this._router.navigateByUrl(`/sign-in?redirect=join&info=${this.info}`);
  }

  joinStudy() {
    if (this.isLoggedIn) {
      const joinStudy = this._study.joinStudy(this.studySearchName, this.studyUniqueID).subscribe((res) => {
        if (res.length === 1) {
          const groupName = res[ 0 ].payload.doc.data()[ 'name' ];
          const groupID = res[ 0 ].payload.doc.id;
          this._study.addMember(groupID, this._user.userID.getValue()).then((test) => {
            this._user.addStudy(groupID, 'member').then(() => {
              this._router.navigateByUrl('/dashboard');
            });
          }).catch((reason) => {
            if (reason === 'already added') {
              this._router.navigateByUrl('/dashboard');
            }
          });
        }
      });
    }
  }
}
