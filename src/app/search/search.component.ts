import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {SearchService} from '../search.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
    searchQuery = '';
    searchType = 'relevant';
    constructor(private title: Title, public searchService: SearchService) {
    }

    ngOnInit() {
        this.title.setTitle('Biblya | Search');
    }

    ngOnDestroy() {
        this.searchService.results = [];
    }

    reSearch(sort_type: string) {
        this.searchType = sort_type;
        this.searchService.searchES(this.searchQuery, sort_type);
    }

}
