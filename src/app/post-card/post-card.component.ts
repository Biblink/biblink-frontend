import { ToastrService } from 'ngx-toastr';
import { Utils } from './../utilities/utils';
import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { StudyDataService } from '../study-data.service';
import { UserDataService } from '../user-data.service';
import { Reply } from '../interfaces/reply';
declare const AOS: any;
@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: [ './post-card.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class PostCardComponent implements OnInit {
  @Input() contributors = [];
  @Input() isLeader = false;
  @Input() userID = '';
  @Input() id = '';
  @Input() isCreator = false;
  @Input() studyID = '';
  @Output() delete = new EventEmitter<boolean>(false);
  @Output() edit = new EventEmitter<boolean>(false);
  @Output() reply = new EventEmitter<string>();
  replies = [];
  activateDeleteModal = false;
  activateReplyModal = false;
  activateSubReplyModal = false;
  replyText = '';
  subReplyText = '';
  replyID = '';
  activateZ = 10;
  contributorImages = [];
  constructor(private afs: AngularFirestore,
    private _user: UserDataService, private _study: StudyDataService,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.contributors.forEach(contributor => {
      let firstTime = false;
      let previousImage = '';
      this.afs.doc(`/users/${ contributor }`).valueChanges().subscribe((value) => {
        if (firstTime) {
          const index = this.contributorImages.indexOf(previousImage);
          this.contributorImages[ index ] = value[ 'data' ][ 'profileImage' ];
        }
        this.contributorImages.push(value[ 'data' ][ 'profileImage' ]);
        firstTime = true;
        previousImage = value[ 'data' ][ 'profileImage' ];
      });
    });
    this.getReplies();

  }

  getReplies() {
    this._study.getPostRepliesByID(this.studyID, this.id).subscribe((replies) => {
      this.replies = [];
      replies.forEach((reply) => {
        let firstTime = false;
        let firstReply = {};
        this._user.getDataFromID(reply[ 'creatorID' ]).subscribe((data) => {
          const profileImage = data[ 'data' ][ 'profileImage' ];
          reply[ 'image' ] = profileImage;
          reply[ 'name' ] = data[ 'name' ];
          reply[ 'subreplies' ] = [];
          this.getSubReplies(reply[ 'id' ]).subscribe((subreplies) => {
            reply[ 'subreplies' ] = [];
            subreplies.forEach((subreply) => {
              let firstSubReplyTime = false;
              let firstSubReply = {};
              this._user.getDataFromID(subreply[ 'creatorID' ]).subscribe((subData) => {
                const subProfileImage = data[ 'data' ][ 'profileImage' ];
                subreply[ 'image' ] = subProfileImage;
                subreply[ 'name' ] = subData[ 'name' ];
                if (firstSubReplyTime) {
                  reply[ 'subreplies' ][ reply[ 'subreplies' ].indexOf(firstSubReply) ] = subreply;
                } else {
                  reply[ 'subreplies' ].push(subreply);
                }
                firstSubReplyTime = true;
                firstSubReply = subreply;
              });
            });
          });
          if (firstTime) {
            this.replies[ this.replies.indexOf(firstReply) ] = reply;
          } else {
            this.replies.push(reply);
          }
          firstTime = true;
          firstReply = reply;
        });
      });
    });
  }

  getSubReplies(postID) {
    return this.afs.doc(`/studies/${ this.studyID }`)
      .collection('posts').doc(this.id).collection('replies').doc(postID)
      .collection('subreplies', ref => ref.orderBy('timestamp', 'asc')).valueChanges();
  }
  addSubReply() {
    const firebaseID = this.afs.createId();
    const reply = new Reply(this.subReplyText, this.userID, Math.round((new Date()).getTime() / 1000), [], []);
    const jsonReply = Utils.toJson(reply);
    jsonReply[ 'id' ] = firebaseID;
    this.afs.doc(`/studies/${ this.studyID }`)
      .collection('posts').doc(this.id).collection('replies').doc(this.replyID).collection('subreplies').doc(firebaseID).set(jsonReply)
      .then(() => {
        this.toastr.show('Created Subreply', 'Succesfully Created Subreply');
        this.subReplyText = '';
      });
  }
  emitDelete() {
    this.delete.emit(true);
  }
  emitEdit() {
    this.edit.emit(true);
  }

  emitReply() {
    this.reply.emit(this.replyText);
    this.replyText = '';
  }

}
