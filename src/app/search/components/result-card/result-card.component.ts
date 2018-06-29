import { Component, Input, OnInit, ViewEncapsulation, EventEmitter, Output, PLATFORM_ID, Inject } from '@angular/core';
import { SearchService } from '../../../core/services/search/search.service';
import {
    trigger,
    style,
    animate,
    transition
} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
import { SimilarVerseResults } from '../../../core/interfaces/similar-verse';
import { Metadata } from '../../../core/interfaces/metadata';
import { isPlatformBrowser } from '@angular/common';
/**
 * access to AOS instance
 */
declare const AOS: any;
/**
 * Result card to display search results
 */
@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: [ './result-card.component.css' ],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('similarState', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('1000ms', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                animate('500ms', style({ opacity: 0 }))
            ]),
        ])
    ]
})
export class ResultCardComponent implements OnInit {
    /**
     * value to see if current client is in the browser
     */
    isBrowser: boolean;
    /**
     * Input Bible verse reference
     */
    @Input() reference: string;
    /**
     * Input index (starting with 0) out of total results
     */
    @Input() index: string;
    /**
     * Input text of verse
     */
    @Input() text: string;
    /**
     * Input similar verses (null by default, changed on (getMoreData){@link ResultCardComponent#getMoreData} call)
     */
    @Input() similarVerses: SimilarVerseResults = null;
    /**
     * Input metadata (null by default, changed on (getMoreData){@link ResultCardComponent#getMoreData} call)
     */
    @Input() metadata: Metadata = null;
    /**
     * Output emitter of copy event, outputs verse
     */
    @Output() copy = new EventEmitter<string>();
    /**
     * Output emitter to request to get more data
     */
    @Output() getMore = new EventEmitter<any>();
    /**
     * Value to see whether or not to display more data
     */
    isSimilar = false;
    /**
     * Value to hold z-index of result card
     */
    activateZ = 10;
    /**
     * Value to hold share text when user shares a search result
     */
    shareText = '';
    /**
     * Value to hold share title when user shares a search result
     */
    shareTitle = '';
    /**
     * Value to hold twitter text when user shares a search result to twitter
     */
    twitterText = '';

    /**
     * Initializes necessary dependencies and does dependency injection
     * @param platformId Platform ID to check if client is in browser
     */
    constructor(@Inject(PLATFORM_ID) platformId) {
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
        this.reference = this.reference.replace(/<\/?em>/g, '');
        this.text = this.text.replace(/<\/?em>/g, '');
        this.shareTitle = this.reference + ' from Biblink Search';
        this.twitterText = this.reference + ': ' + this.text.trim() + ' from Biblink Search';
        this.shareText = this.twitterText + ': https://biblink.io/search';
    }
    /**
     * Requests to get more data from results component and then shows the results
     */
    showMoreData() {
        const updatedReference = this.reference.replace(/<\/?em>/g, '');
        if (this.similarVerses === null && this.metadata === null) {
            this.getMore.emit({ 'ref': updatedReference, 'request': true, 'index': this.index });
        }
        this.isSimilar = true;
    }
    /**
     * Emits value to copy to clipboard
     */
    showCopyToClipboard() {
        this.copy.emit(this.reference.replace(/<\/?em>/g, ''));
    }
}
