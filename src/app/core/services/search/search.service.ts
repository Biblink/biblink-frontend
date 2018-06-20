import { SimilarVerseResults } from './../../interfaces/similar-verse';
import { SearchResults, Result } from './../../interfaces/search-results';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chapter } from '../../interfaces/chapter';
import { Books } from '../../interfaces/books';
import { VerseQuery } from '../../interfaces/verse-query';
import { Metadata } from '../../interfaces/metadata';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    results: Result[] = [];
    found = 'not_found';
    searchUrl: string;
    constructor(private http: HttpClient) {
        this.searchUrl = environment.es_url;
    }

    searchES(query, sort_type = 'relevant') {
        this.found = 'pending';
        this.http.get<SearchResults>(`${ this.searchUrl }/search?term=${ query }&sort_type=${ sort_type }`).subscribe(res => {
            if (res[ 'results' ].length === 0) {
                this.found = 'not_found';
                this.results = [];
            } else {
                this.found = 'found';
                this.results = res.results;
            }
        });
    }

    getVerseText(reference: string): Observable<VerseQuery> {
        return this.http.get<VerseQuery>(`${ this.searchUrl }/query?query=${ reference }`);
    }

    getChapter(book: string, chapter: string): Observable<Chapter> {
        return this.http.get<Chapter>(`${ this.searchUrl }/query?book=${ book }&chapter=${ chapter }`);
    }
    getBooks(): Observable<Books> {
        return this.http.get<Books>(`${ this.searchUrl }/all`);
    }
    getSimilarVerses(reference: string): Observable<SimilarVerseResults> {
        return this.http.get<SimilarVerseResults>(`${ this.searchUrl }/similarity?reference=${ reference }`);
    }

    getMetadata(book: string): Observable<Metadata> {
        return this.http.get<Metadata>(`${ this.searchUrl }/metadata?book=${ book }`);
    }
}
