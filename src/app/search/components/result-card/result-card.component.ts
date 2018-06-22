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
declare const AOS: any;
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
    isBrowser: boolean;
    @Input() reference: string;
    @Input() index: string;
    @Input() text: string;
    @Input() similarVerses: SimilarVerseResults = null;
    @Input() metadata: Metadata = null;

    @Output() copy = new EventEmitter<string>();
    @Output() getMore = new EventEmitter<any>();
    isSimilar = false;
    activateZ = 10;
    shareText = '';
    shareTitle = '';
    twitterText = '';


    constructor(@Inject(PLATFORM_ID) platformId) {
        this.isBrowser = isPlatformBrowser(platformId)
    }

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

    showMoreData() {
        const updatedReference = this.reference.replace(/<\/?em>/g, '');
        if (this.similarVerses === null && this.metadata === null) {
            this.getMore.emit({ 'ref': updatedReference, 'request': true, 'index': this.index });
        }
        this.isSimilar = true;
    }

    showCopyToClipboard() {
        this.copy.emit(this.reference.replace(/<\/?em>/g, ''));
    }
}
