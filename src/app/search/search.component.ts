import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {SearchService} from '../search.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    searchQuery = '';

    constructor(private title: Title, public searchService: SearchService) {
    }

    ngOnInit() {
        this.title.setTitle('Biblya | Search');
    }

}
