import { Component, OnInit } from '@angular/core';
import {SearchService} from '../search.service';

declare const AOS: any;
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  constructor(public _search: SearchService) {}

  ngOnInit() {}
}
