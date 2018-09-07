import { first, finalize } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserDataService } from '../../../core/services/user-data/user-data.service';

/**
 * File upload component to handle file uploads
 */
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: [ './file-upload.component.scss' ]
})
export class FileUploadComponent {
  /**
   * Input value to determine height of component
   */
  @Input() height = '300px';

  /**
   * Input value to determine border radius of profile image
   */
  @Input() borderRadius = '100%';

  /**
   * Input value to determine display width of profile image
   */
  @Input() profileImageWidth = '154px';

  /**
   * Input value to determine display height of profile image
   */
  @Input() profileImageHeight = '154px';

  /**
   * Input value to determine margin around profile image
   */
  @Input() profileMargin = '50px';

  /**
   * Output emitter to emit download url of image
   */
  @Output() url = new EventEmitter<string>();

  /**
   *  Main upload task
   */
  task: AngularFireUploadTask;

  /**
   * Observable to monitor upload progress
   */
  percentage: Observable<number>;

  /**
   * Observable to store current task value
   */
  snapshot: Observable<any>;

  /**
   * Value to store download url
   */
  downloadURL: string;

  /**
   * value that determines whether or not file is uploaded
   */
  uploaded = false;

  /**
   * value to see if dropzone is being hovered
   */
  isHovering: boolean;

  /**
   * Initializes necessary dependency and does dependency injection
   * @param {AngularFireStorage} storage AngularFireStorage dependency to access firebase storage
   * @param {UserDataService} _user UserData service dependency to get user profile image
   */
  constructor(private storage: AngularFireStorage, private _user: UserDataService) { }

  /**
   * Toggles [isHovering]{@link FileUploadComponent#isHovering}
   * @param {boolean} event whether or not user is hovering
   */
  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  /**
   * Uploads list of files
   * @param {FileList} event list of files
   */
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

  /**
   * Determines if the upload task is active
   * @param snapshot checks current upload task
   */
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

}
