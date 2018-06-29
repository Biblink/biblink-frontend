import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../../core/services/search/search.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { isPlatformBrowser } from '@angular/common';

/**
 * access to AOS instance
 */
declare const AOS: any;
/**
 * Search page component to display search page and to search Bible
 */
@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: [ './search.page.css' ]
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewChecked {
    /**
     * value to keep track of browser
     */
    isBrowser: boolean;
    /**
     * value to keep track of search query
     */
    searchQuery = '';
    /**
     * value to keep track of value being searched
     */
    isSearching = false;
    /**
     * type of search to be implemented
     */
    searchType = 'relevant';
    /**
     * Initializes necessary dependency and does dependency injection
     * @param {Title} title Title dependency to change title of page
     * @param {SearchService} searchService Search service dependency to search values
     * @param {Router} _router Router dependency to access router for navigation
     * @param {ActivatedRoute} _route ActivatedRoute dependency to access router parameters and check end of navigation
     * @param {ChangeDetectorRef} cdr ChangeDetectorRef dependency to detect changes
     * @param {Angulartics2} angulartics2 Angulartics2 dependency to handle analytics
     * @param {PLATFORM_ID} platformId Platform ID to check if client is in browser
     */
    constructor(
        private title: Title,
        public searchService: SearchService,
        private _router: Router,
        private _route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private angulartics2: Angulartics2,
        @Inject(PLATFORM_ID) platformId
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }
    /**
    * Initializes component
    */
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
    /**
     * Destroys component when not used. Resets result array
     */
    ngOnDestroy() {
        this.searchService.results = [];
    }
    /**
     * Detects changes after view has been checked
     */
    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    /**
     * Search bible based on user's query
     * @param {string} sort_type type of sort to implement in results
     */
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
