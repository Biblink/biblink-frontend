import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: [ './post-card.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class PostCardComponent implements OnInit {
  @Input() contributors = [];
  @Input() isLeader = false;
  @Input() isCreator = false;
  @Output() delete = new EventEmitter<boolean>(false);
  @Output() edit = new EventEmitter<boolean>(false);
  activateDeleteModal = false;
  activateEditModal = false;
  replies = [];
  activateZ = 10;
  contributorImages = [];
  constructor(private afs: AngularFirestore) { }

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
  }

  emitDelete() {
    this.delete.emit(true);
  }
  emitEdit() {
    this.edit.emit(true);
  }

}
