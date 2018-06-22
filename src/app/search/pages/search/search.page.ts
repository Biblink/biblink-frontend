import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../../core/services/search/search.service';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { isPlatformBrowser } from '@angular/common';

declare const AOS: any;
@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: [ './search.page.css' ]
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewChecked {
    isBrowser: boolean;
    searchQuery = '';
    isSearching = false;
    searchType = 'relevant';

    constructor(private title: Title, public searchService: SearchService,
        private _router: Router,
        private _scrollToService: ScrollToService,
        private _route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private angulartics2: Angulartics2,
        @Inject(PLATFORM_ID) platformId
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        if (this.isBrowser) {
            AOS.init({
                disable: 'mobile'
            });
        }
        this._router.events.subscribe((event) => {
            if (!(event instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
        });
        this.title.setTitle('Biblink | Search');
        this._route.queryParams.subscribe(param => {
            if (param[ 'query' ] !== undefined) {
                this.searchQuery = param[ 'query' ];
                this.reSearch('relevant');
                this.isSearching = true;
            }
        });
    }

    ngOnDestroy() {
        this.searchService.results = [];
    }

    scroll() {
    }
    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    reSearch(sort_type: string) {
        this.isSearching = true;
        this.searchType = sort_type;
        this.searchService.searchES(this.searchQuery, sort_type);
        this.angulartics2.eventTrack.next({
            action: 'User performed search',
            properties: {
                category: 'service-use',
                label: 'action',
                value: `${ this.searchQuery }`
            },

        });
    }

}
