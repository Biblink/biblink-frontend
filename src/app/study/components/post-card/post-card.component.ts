import { ToastrService } from 'ngx-toastr';
import { Utils } from '../../../utilities/utils';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output,
  HostListener,
  ElementRef
} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StudyDataService } from '../../services/study-data.service';
import { UserDataService } from '../../../core/services/user-data/user-data.service';
import { Reply } from '../../../core/interfaces/reply';
/**
 * Post card component for all study posts
 */
@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: [ './post-card.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class PostCardComponent implements OnInit {
  /**
   * Input that holds list of contributors
   */
  @Input() contributors = [];
  /**
   * Input that checks if card is to display annotations
   */
  @Input() isAnnotation = false;
  /**
   * Input for a chapter reference for annotation card
   */
  @Input() chapterRef = '';
  /**
   * Input to see person viewing is a leader
   */
  @Input() isLeader = false;
  /**
   * Input value of user ID
   */
  @Input() userID = '';
  /**
   * Input value of post ID
   */
  @Input() id = 'default';
  /**
   * Input value to see if current post is the current last loaded post
   * Used in (onMouseOver){@link PostCardComponent#onMouseOver}
   */
  @Input() isLast = false;
  /**
   * Input value to see if current user is the creator of post
   */
  @Input() isCreator = false;
  /**
   * Input value of studyID
   */
  @Input() studyID = 'default';
  /**
   * Output emitter for delete event
   */
  @Output() delete = new EventEmitter<boolean>(false);
  /**
   * Output emitter for edit event
   */
  @Output() edit = new EventEmitter<boolean>(false);
  /**
   * Output emitter for reply event, emits reply text
   */
  @Output() reply = new EventEmitter<string>();
  /**
   * Output emitter for more event
   */
  @Output() more = new EventEmitter<boolean>(false);
  /**
   * List to hold replies
   */
  replies = [];

  // modal activations
  /**
   * Value to determine whether or not to show delete modal
   */
  activateDeleteModal = false;
  /**
   * Value to determine whether or not to show reply modal
   */
  activateReplyModal = false;
  /**
   * Value to determine whether or not to show subreply modal
   */
  activateSubReplyModal = false;

  // default form values
  /**
   * Default reply text for reply modal
   */
  replyText = '';
  /**
   * Default subreply text for subreply modal
   */
  subReplyText = '';
  /**
   * Current replyID for adding a subreply
   */
  replyID = '';
  /**
   * Value to hold current z-index
   */
  activateZ = 0;
  /**
   * List of contributor images
   */
  contributorImages = [];
  /**
   * Initializes dependencies and does dependency injection
   * @param afs AngularFirestore dependency to acess firestore
   * @param _user UserData service dependency to get user data
   * @param _study StudyData service to get post replies
   * @param toastr Toastr service to show notifications
   */
  constructor(
    private afs: AngularFirestore,
    private _user: UserDataService,
    private _study: StudyDataService,
    private toastr: ToastrService
  ) { }
  /**
   * Initializes component
   */
  ngOnInit() {
    this.contributors.forEach(contributor => {
      let firstTime = false;
      let previousImage = '';
      this.afs
        .doc(`/users/${ contributor }`)
        .valueChanges()
        .subscribe(value => {
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
  /**
   * Gets replies of post
   */
  getReplies() {
    let repliesSubscriber = this._study.getPostRepliesByID(
      this.studyID,
      this.id
    );
    if (this.isAnnotation) {
      repliesSubscriber = this._study.getAnnotationRepliesByID(
        this.studyID,
        this.chapterRef,
        this.id
      );
    }
    repliesSubscriber.subscribe(replies => {
      this.replies = [];
      replies.forEach(reply => {
        let firstTime = false;
        let firstReply = {};
        if (reply[ 'htmlText' ] === undefined || reply[ 'htmlText' ] === '') {
          reply[ 'htmlText' ] = reply[ 'text' ];
        }
        this._user.getDataFromID(reply[ 'creatorID' ]).subscribe(data => {
          const profileImage = data[ 'data' ][ 'profileImage' ];
          reply[ 'image' ] = profileImage;
          reply[ 'name' ] = data[ 'name' ];
          reply[ 'subreplies' ] = [];
          this.getSubReplies(reply[ 'id' ]).subscribe(subreplies => {
            reply[ 'subreplies' ] = [];
            subreplies.forEach(subreply => {
              let firstSubReplyTime = false;
              let firstSubReply = {};
              this._user
                .getDataFromID(subreply[ 'creatorID' ])
                .subscribe(subData => {
                  const subProfileImage = subData[ 'data' ][ 'profileImage' ];
                  if (
                    subreply[ 'htmlText' ] === undefined ||
                    subreply[ 'htmlText' ] === ''
                  ) {
                    subreply[ 'htmlText' ] = subreply[ 'text' ];
                  }
                  subreply[ 'image' ] = subProfileImage;
                  subreply[ 'name' ] = subData[ 'name' ];
                  if (firstSubReplyTime) {
                    reply[ 'subreplies' ][
                      reply[ 'subreplies' ].indexOf(firstSubReply)
                    ] = subreply;
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

  /**
   * Gets subreplies of post given a reply ID
   * @param replyID Reply ID
   */
  getSubReplies(replyID) {
    if (this.isAnnotation) {
      return this.afs
        .doc(`studies/${ this.studyID }`)
        .collection('annotations')
        .doc(this.chapterRef)
        .collection('chapter-annotations')
        .doc(this.id)
        .collection('replies')
        .doc(replyID)
        .collection('subreplies', ref => ref.orderBy('timestamp', 'asc'))
        .valueChanges();
    }
    return this.afs
      .doc(`studies/${ this.studyID }`)
      .collection('posts')
      .doc(this.id)
      .collection('replies')
      .doc(replyID)
      .collection('subreplies', ref => ref.orderBy('timestamp', 'asc'))
      .valueChanges();
  }
  /**
   * Adds a subreply to post
   */
  addSubReply() {
    const firebaseID = this.afs.createId();
    const reply = new Reply(
      this.subReplyText,
      this.userID,
      Math.round(new Date().getTime() / 1000),
      [],
      []
    );
    const jsonReply = Utils.toJson(reply);
    jsonReply[ 'id' ] = firebaseID;
    let ref = this.afs
      .doc(`studies/${ this.studyID }`)
      .collection('posts')
      .doc(`${ this.id }`);
    if (this.isAnnotation) {
      ref = this.afs
        .doc(`studies/${ this.studyID }`)
        .collection('annotations')
        .doc(this.chapterRef)
        .collection('chapter-annotations')
        .doc(this.id);
    }
    if (!this.isAnnotation) {
      const updateContributor = ref.valueChanges().subscribe(val => {
        if (val[ 'contributors' ].indexOf(reply.creatorID) === -1) {
          val[ 'contributors' ].push(reply.creatorID);
        }
        ref.update(val).then(() => {
          updateContributor.unsubscribe();
        });
      });
    }
    ref
      .collection('replies')
      .doc(this.replyID)
      .collection('subreplies')
      .doc(firebaseID)
      .set(jsonReply)
      .then(() => {
        this.toastr.show('Created Subreply', 'Succesfully Created Subreply');
        this.subReplyText = '';
      });
  }
  /**
   * Emits delete events
   */
  emitDelete() {
    this.delete.emit(true);
  }
  /**
   * Emits edit event
   */
  emitEdit() {
    this.edit.emit(true);
  }
  /**
   * Emits reply data for post
   */
  emitReply() {
    this.reply.emit(this.replyText);
    this.replyText = '';
  }

  /**
   * Listens to mouseover to emit the more event to get more posts
   */
  @HostListener('mouseover')
  onMouseOver() {
    if (this.isLast) {
      this.more.emit(true);
    }
  }
}
