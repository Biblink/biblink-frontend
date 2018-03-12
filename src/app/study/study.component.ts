import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudyDataService } from '../study-data.service';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: [ './study.component.css' ]
})
export class StudyComponent implements OnInit {
  title = '';
  studyData;
  groupID = '';
  constructor(private _router: Router, private _study: StudyDataService) {

  }

  ngOnInit() {
    this.groupID = this._router.url.split('/').pop();
    this._study.getStudyData(this.groupID).subscribe((data) => {
      this.title = data[ 'name' ];
      this.studyData = data;
    });
  }

}
