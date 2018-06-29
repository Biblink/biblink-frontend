import { SimilarVerseResults } from './../../../core/interfaces/similar-verse';
import { Component, EventEmitter, Input, OnInit, Output, Inject, PLATFORM_ID } from '@angular/core';
import { SearchService } from '../../../core/services/search/search.service';
import { Result } from '../../../core/interfaces/search-results';
import { takeUntil } from 'rxjs/operators';
import { Metadata } from '../../../core/interfaces/metadata';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';

/**
 * access to AOS instance
 */
declare const AOS: any;

/**
 * Results component to display search results
 */
@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: [ './results.component.css' ]
})
export class ResultsComponent implements OnInit {
    /**
     * Input of results to display
     */
    @Input() results: Result[] = [];
    /**
     * Output emitter to emit sort type
     */
    @Output() type: EventEmitter<string> = new EventEmitter();
    /**
     * Array to hold list of metadata results for all returned reuslts
     */
    metadatas: Metadata[] = [];
    /**
     * Array to hold list of similar verse results for all returned results
     */
    similarVerses: SimilarVerseResults[] = [];
    /**
     * value to see if current client is in the browser
     */
    isBrowser = false;
    /**
     * Current sort type based on select in html
     */
    sortType = 'relevant';
    /**
     * Initializes necessary dependencies and does dependency injection
     * @param {SearchService} _search SearchService dependency to handle getting more data on a specific verse
     * @param {PLATFORM_ID} platformId Platform ID to check if client is in browser
     * @param {toastr} toastr Toastr service to display notifications
     */
    constructor(private _search: SearchService, @Inject(PLATFORM_ID) platformId: string, private toastr: ToastrService) {
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
        this.results.forEach(() => {
            this.metadatas = [ ...this.metadatas, null ];
            this.similarVerses = [ ...this.similarVerses, null ];
        });
        this.type.emit(this.sortType);
    }

    /**
     * Gets more data on certain search result
     * @param {any} $event event emitted by a result-card
     */
    getMoreData($event) {
        if ($event.request) {
            const ref_part = $event.ref.split(' ');
            ref_part.pop();
            this._search.getSimilarVerses($event.ref).take(1).subscribe((res) => {
                this.similarVerses[ $event.index ] = res;
            });
            this._search.getMetadata(ref_part.join(' ')).take(1).subscribe((metadata) => {
                this.metadatas[ $event.index ] = metadata;
            });
        }
    }

    /**
     * Display notification that reference is copied
     * @param reference Bible reference that is copied to clipboard
     */
    showCopy(reference) {
        this.toastr.show('Successfully copied ' + reference + ' to your clipboard', 'Successful Copy');
    }

    /**
     * Emits sort type to parent component
     */
    sortSearch() {
        this.type.emit(this.sortType);
    }
}
