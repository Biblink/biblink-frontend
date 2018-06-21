import { SimilarVerseResults } from './../../../core/interfaces/similar-verse';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchService } from '../../../core/services/search/search.service';
import { Result } from '../../../core/interfaces/search-results';
import { takeUntil } from 'rxjs/operators';
import { Metadata } from '../../../core/interfaces/metadata';
import { ToastrService } from 'ngx-toastr';

declare const AOS: any;

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: [ './results.component.css' ]
})
export class ResultsComponent implements OnInit {
    @Input() results: Result[] = [];
    @Output() type: EventEmitter<string> = new EventEmitter();
    metadatas: Metadata[] = [];
    similarVerses: SimilarVerseResults[] = [];
    sortType = 'relevant';
    constructor(private _search: SearchService, private toastr: ToastrService) {
    }

    ngOnInit() {
        AOS.init({
            disable: 'mobile'
        });
        this.results.forEach(() => {
            this.metadatas = [ ...this.metadatas, null ];
            this.similarVerses = [ ...this.similarVerses, null ];
        });
        this.type.emit(this.sortType);
    }

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

    showCopy(reference) {
        this.toastr.show('Successfully copied ' + reference + ' to your clipboard', 'Successful Copy');
    }
    sortSearch() {
        this.type.emit(this.sortType);
    }
}
