import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/first';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: [ './file-upload.component.scss' ]
})
export class FileUploadComponent {
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

  constructor(private storage: AngularFireStorage, private db: AngularFirestore) { }


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
    const customMetadata = { creationDate: `Created on ${ new Date().getTime() }` };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata });

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges();

    // The file's download URL
    this.task.downloadURL().first().subscribe((url_response) => {
      this.downloadURL = url_response;
      this.url.emit(url_response);
      this.uploaded = true;
    });

  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
