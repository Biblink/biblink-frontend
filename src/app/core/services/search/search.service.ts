import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Verse } from '../../interfaces/verse.interface';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    results: Verse[] = [];
    found = 'not_found';
    searchUrl: string;
    constructor(private http: HttpClient) {
        this.searchUrl = environment.es_url;
    }

    searchES(query, sort_type = 'relevant') {
        this.found = 'pending';
        this.http.get(`${ this.searchUrl }/search?term=${ query }&sort_type=${ sort_type }`).subscribe(res => {
            if (res[ 'results' ].length === 0) {
                this.found = 'not_found';
                this.results = [];
            } else {
                this.found = 'found';
                this.results = res[ 'results' ] as Verse[];
            }
        });
    }

    getVerseText(reference: string): Observable<any> {
        return this.http.get(`${ this.searchUrl }/query?query=${ reference }`);
    }

    getChapter(book: string, chapter: string): Observable<any> {
        return this.http.get(`${ this.searchUrl }/query?book=${ book }&chapter=${ chapter }`);
    }
    getBooks(): Observable<any> {
        return this.http.get(`${ this.searchUrl }/all`);
    }
    getSimilarVerses(reference: string): Observable<any> {
        return this.http.get(`${ this.searchUrl }/similarity?reference=${ reference }`);
    }

    getMetadata(book: string): Observable<any> {
        return this.http.get(`${ this.searchUrl }/metadata?book=${ book }`);
    }
}
