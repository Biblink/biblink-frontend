import { Component, OnInit } from '@angular/core';
import { Verse } from '../types/verse.type';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  test_data: Verse[] = [
    {
      reference: 'Leviticus 19:16',
      number: 16,
      chapter: 19,
      book: 'Leviticus',
      text:
        // tslint:disable-next-line:quotemark
        "\"'Do not go about spreading slander among your people. \"'Do not do anything that endangers your neighbor's life. I am the Lord.",
      id: '12356'
    },
    {
      reference: 'Matthew 5:13',
      number: 13,
      chapter: 5,
      book: 'Matthew',
      text:
        '"You are the light of the world. A town built on a hill cannot be hidden."',
      id: '12356'
    },
    {
      reference: 'John 1:4',
      number: 4,
      chapter: 1,
      book: 'John',
      text: 'In him was life, and that life was the light of all mankind.',
      id: '12356'
    }
  ];
  verse_data_observable: Observable<Verse[]>;
  constructor() {}

  ngOnInit() {
    this.verse_data_observable = new Observable<Verse[]>(observer => {
      observer.next(this.test_data);
      observer.complete();
    });
  }
}
