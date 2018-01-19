import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {SearchService} from '../search.service';
import {
    trigger,
    state,
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
    isSimilar = false;
    similarVerses = [];

    constructor(private _search: SearchService) {
    }

    ngOnInit() {
    }

    showSimilar() {
        const updatedReference = this.reference.replace(/<\/?em>/g, '');
        this._search.getSimilarVerses(updatedReference).subscribe(res => {
            this.similarVerses = res['similar_verses'];
        });
        this.isSimilar = true;
    }

}
