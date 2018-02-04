import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SearchService} from '../search.service';

declare const AOS: any;

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
    @Output() type: EventEmitter<string> = new EventEmitter();
    sortType = 'relevant';
    constructor(public _search: SearchService) {
    }

    ngOnInit() {
        AOS.init({
            disable: 'mobile'
        })
        this.type.emit(this.sortType);
    }

    sortSearch() {
        this.type.emit(this.sortType);
    }
}
