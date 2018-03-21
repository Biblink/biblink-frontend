import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { StudyDataService } from '../study-data.service';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: [ './post-card.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class PostCardComponent implements OnInit {
  @Input() contributors = [];
  @Input() isLeader = false;
  @Input() id = '';
  @Input() isCreator = false;
  @Input() studyID = '';
  @Output() delete = new EventEmitter<boolean>(false);
  @Output() edit = new EventEmitter<boolean>(false);
  @Output() reply = new EventEmitter<string>();
  replies = [];
  activateDeleteModal = false;
  activateReplyModal = false;
  replyText = '';
  activateZ = 10;
  contributorImages = [];
  constructor(private afs: AngularFirestore, private _user: UserDataService, private _study: StudyDataService) { }

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
        this._user.getDataFromID(reply['creatorID']).subscribe((data) => {
          const profileImage = data['data']['profileImage'];
          reply['image'] = profileImage;
          reply['name'] = data['name'];
          if (firstTime) {
            this.replies[this.replies.indexOf(firstReply)] = reply;
          } else {
            this.replies.push(reply);
          }
          firstTime = true;
          firstReply = reply;
        });
      });
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
  }

}
