import { Component, Output, Input, EventEmitter } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { StudyDataService } from '../../services/study-data.service';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { unescapeIdentifier } from '../../../../../node_modules/@angular/compiler';

@Component ({
    selector: 'right-bar-announcement',
    templateUrl: './right-bar-announcements.component.html',
    styleUrls: ['./right-bar-announcements.component.css']
})

export class RightBarAnnouncments {

 /**
   * List of key announcements
   */
  keyAnnouncements = [];
   /**
   * @ignore
   */
  keyAnnouncementSubscription: Subscription = new Subscription();
   /**
   * Group ID
   */
  groupID = 'default';
  /**
   * Behavior Subject to handle loading state
   */
  isLoading = new BehaviorSubject<boolean>(true);
  /**
   * Value to see if posts should be reset
   */
  resetPosts = false;
  /**
   * @ignore
   */
  postSubscription: Subscription = new Subscription();
    /**
   * List of posts to be checked
   */
  private _posts = new BehaviorSubject([]);
   /**
   * Post type to filter by
   */
  type = 'all';
    /**
   * Number of members to display in sidebar
   */
  numberOfMembers = 3;
  /**
   * List of members
   */
  members = [];
   /**
   * @ignore
   */
  membersSubscription: Subscription = new Subscription();

  @Output() action = new EventEmitter<boolean>();

  @Output() announcement = new EventEmitter<string>();

  @Output() tab = new EventEmitter<string>();

  @Output() promote = new EventEmitter<string[]>();



  expandActions() {
      this.action.emit(true);
  }

  setPostType() {
      this.announcement.emit('announcement')
  }

  switchTab(tab : string) {
      this.tab.emit(tab)
  }

  verifyPromote(name: string, uid : string){
      this.promote.emit([name, uid])
  }



   /**
   * Destroys component and unsubscribes from all subscriptions
   */
  ngOnDestroy() {
    this.keyAnnouncementSubscription.unsubscribe();
    this.postSubscription.unsubscribe();
    this.membersSubscription.unsubscribe();
  }

  constructor(
    private _study: StudyDataService,
    private _user: UserDataService,
  ) { }

  /**
   * Checks if htmlText property is present
   */
  private _checkHtmlText(val: any) {
    val[ 'htmlText' ] =
      val[ 'htmlText' ] === undefined || val[ 'htmlText' ] === ''
        ? val[ 'text' ]
        : val[ 'htmlText' ];
    return val;
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
   * Get study announcements
   */
  getAnnouncements() {
    this.isLoading.next(true);
    this.resetPosts = true;
    this._getFeedByType('announcement');
    this.type = 'announcement';
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
              value => value[ 'id' ] === val[ 'id' ]
            );
            this._user
              .getDataFromID(val[ 'creatorID' ])
              .take(1)
              .subscribe(response => {
                val[ 'image' ] = response[ 'data' ][ 'profileImage' ];
                if (contained.length === 1) {
                  this.keyAnnouncements[
                    this.keyAnnouncements.indexOf(contained[ 0 ])
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
          this._user.getDataFromID(member[ 'uid' ]).subscribe(res => {
            if (firstTime) {
              this.members[ this.members.indexOf(oldImage) ] = {
                name: res[ 'name' ],
                image: res[ 'data' ][ 'profileImage' ],
                role: member[ 'role' ],
                uid: member[ 'uid' ]
              };
            } else {
              this.members.push({
                name: res[ 'name' ],
                uid: member[ 'uid' ],
                image: res[ 'data' ][ 'profileImage' ],
                role: member[ 'role' ]
              });
            }
            firstTime = true;
            oldImage = {
              name: res[ 'name' ],
              uid: member[ 'uid' ],
              image: res[ 'data' ][ 'profileImage' ],
              role: member[ 'role' ]
            };
          });
        });
      });
  }
}