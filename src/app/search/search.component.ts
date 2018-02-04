import {AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {SearchService} from '../search.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';

declare const AOS: any;
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewChecked {
    searchQuery = '';
    isSearching = false;
    searchType = 'relevant';

    constructor(private title: Title, public searchService: SearchService,
                private _scrollToService: ScrollToService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.title.setTitle('Biblya | Search');
        AOS.init({
            disable: 'mobile'
        });
    }

    ngOnDestroy() {
        this.searchService.results = [];
    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    reSearch(sort_type: string) {
        this.isSearching = true;
        this.searchType = sort_type;
        this.searchService.searchES(this.searchQuery, sort_type);
    }

    public seeResults() {
        const config: ScrollToConfigOptions = {
            target: 'results'
        };

        this._scrollToService.scrollTo(config);
        this.cdr.detectChanges();
    }

}
