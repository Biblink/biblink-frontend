
import { first, finalize } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';

import { UserDataService } from '../../../user-data.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: [ './file-upload.component.scss' ]
})
export class FileUploadComponent {
  @Input() height = '300px';
  @Input() borderRadius = '100%';
  @Input() profileImageWidth = '154px';
  @Input() profileImageHeight = '154px';
  @Input() profileMargin = '50px';
  @Output() url = new EventEmitter<string>();

  // Main task
  task: AngularFireUploadTask;

  // Progress monitoring
  percentage: Observable<number>;

  snapshot: Observable<any>;

  // Download URL
  downloadURL: string;

  uploaded = false;

  // State for dropzone CSS toggling
  isHovering: boolean;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private _user: UserDataService) { }


  toggleHover(event: boolean) {
    this.isHovering = event;
  }


  uploadProfileImage(event: FileList) {
    // The File object
    const file = event.item(0);

    // Client-side validation example
    if (file.type.split('/')[ 0 ] !== 'image') {
      console.error('unsupported file type :( ');
      return;
    }
    console.log('uploading profile image');
    // The storage path

    const path = `profile_images/${ new Date().getTime() }_${ Math.floor(Math.random() * 2000) }_${ file.name }`;

    // Totally optional metadata
    const customMetadata = { creationDate: `Created on ${ new Date().getTime() }`, uid: this._user.userID.getValue() };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata });
    const fileRef = this.storage.ref(path);
    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges();

    // The file's download URL
    this.task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().pipe(first()).subscribe((url_response) => {
          this.downloadURL = url_response;
          this.url.emit(url_response);
          this.uploaded = true;
        });
      })).subscribe();

  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
