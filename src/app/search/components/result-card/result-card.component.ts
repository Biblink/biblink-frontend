import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SearchService } from '../../../core/services/search/search.service';
import {
    trigger,
    style,
    animate,
    transition
} from '@angular/animations';
import { ToastrService } from 'ngx-toastr';
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
    @Input() reference: string;
    @Input() text: string;
    isSimilar = false;
    activateZ = 10;
    shareText = '';
    shareTitle = '';
    twitterText = '';
    similarVerses = [];
    metadata = { 'author': '', 'date': '' };

    constructor(private _search: SearchService, private toastr: ToastrService) {
    }

    ngOnInit() {
        AOS.init({
            disable: 'mobile'
        });
        this.reference = this.reference.replace(/<\/?em>/g, '');
        this.text = this.text.replace(/<\/?em>/g, '');
        this.shareTitle = this.reference + ' from Biblya Search';
        this.twitterText = this.reference + ': ' + this.text.trim() + ' from Biblya Search';
        this.shareText = this.twitterText + ': https://biblya.co/search';
    }

    showMoreData() {
        const updatedReference = this.reference.replace(/<\/?em>/g, '');
        const ref_parts = updatedReference.split(' ');
        ref_parts.pop();
        this._search.getSimilarVerses(updatedReference).subscribe(res => {
            this.similarVerses = res[ 'similar_verses' ];
        });
        this._search.getMetadata(ref_parts.join(' ')).subscribe(res => {
            this.metadata = res[ 'metadata' ];
        });
        this.isSimilar = true;
    }

    showCopyToClipboard() {
        this.toastr.show('Successfully copied ' + this.reference + ' to your clipboard', 'Successful Copy');
    }
}
