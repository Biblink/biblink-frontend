import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../search.service';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

declare const AOS: any;
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: [ './search.component.css' ]
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewChecked {
    searchQuery = '';
    isSearching = false;
    searchType = 'relevant';

    constructor(private title: Title, public searchService: SearchService,
        private _router: Router,
        private _scrollToService: ScrollToService,
        private _route: ActivatedRoute,
        private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this._router.events.subscribe((event) => {
            if (!(event instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
        });
        this.title.setTitle('Biblya | Search');
        this._route.queryParams.subscribe(param => {
            if (param[ 'query' ] !== undefined) {
                this.searchQuery = param[ 'query' ];
                this.reSearch('relevant');
                this.isSearching = true;
            }
        });
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

}
