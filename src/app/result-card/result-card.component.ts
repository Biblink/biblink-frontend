import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {SearchService} from '../search.service';
import {
    trigger,
    style,
    animate,
    transition
} from '@angular/animations';

@Component({
    selector: 'app-result-card',
    templateUrl: './result-card.component.html',
    styleUrls: ['./result-card.component.css'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('similarState', [
            transition(':enter', [
                style({opacity: 0}),
                animate('1000ms', style({opacity: 1}))
            ]),
            transition(':leave', [
                style({opacity: 1}),
                animate('500ms', style({opacity: 0}))
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

    constructor(private _search: SearchService) {
    }

    ngOnInit() {
        this.reference = this.reference.replace(/<\/?em>/g, '');
        this.text = this.text.replace(/<\/?em>/g, '');
        this.shareTitle = this.reference + ' from Biblya Search';
        this.twitterText = this.reference + ': ' + this.text.trim() + ' from Biblya Search';
        this.shareText = this.twitterText + ': https://biblya.co/search';
    }

    showSimilar() {
        const updatedReference = this.reference.replace(/<\/?em>/g, '');
        this._search.getSimilarVerses(updatedReference).subscribe(res => {
            this.similarVerses = res['similar_verses'];
        });
        this.isSimilar = true;
    }

}
