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
/**
 * Search service to handle all requests to elastic search and searching the Bible
 */
@Injectable({
    providedIn: 'root'
})
export class SearchService {
    /**
     * List of search results
     */
    results: Result[] = [];
    /**
     * String to see if data has been found
     */
    found = 'not_found';
    /**
     * Elasticsearch URL provided by the environment
     */
    searchUrl: string;
    /**
     * Initializes dependencies and does dependency injection
     * @param {HttpClient} http Http Client dependency to handle http requests
     */
    constructor(private http: HttpClient) {
        this.searchUrl = environment.es_url;
    }
    /**
     * Searches ES instance given a query and a sort type
     * @param {string} query Search string
     * @param {string} sort_type Sort type to use
     */
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
    /**
     * Gets verse text given a verse reference
     * @param {string} reference Verse Reference
     */
    getVerseText(reference: string): Observable<VerseQuery> {
        return this.http.get<VerseQuery>(`${ this.searchUrl }/query?query=${ reference }`);
    }
    /**
     * Gets all verses of a requested chapter
     * @param {string} book Requested Book
     * @param {number} chapter Requested Chapter
     */
    getChapter(book: string, chapter: number): Observable<Chapter> {
        return this.http.get<Chapter>(`${ this.searchUrl }/query?book=${ book }&chapter=${ chapter }`);
    }
    /**
     * Gets all books of the Bible
     */
    getBooks(): Observable<Books> {
        return this.http.get<Books>(`${ this.searchUrl }/all`);
    }
    /**
     * Gets all similar verses to a particular verse reference
     * @param {string} reference Verse Reference
     */
    getSimilarVerses(reference: string): Observable<SimilarVerseResults> {
        return this.http.get<SimilarVerseResults>(`${ this.searchUrl }/similarity?reference=${ reference }`);
    }
    /**
     * Gets metadata on a book
     * @param {string} book Book name
     */
    getMetadata(book: string): Observable<Metadata> {
        return this.http.get<Metadata>(`${ this.searchUrl }/metadata?book=${ book }`);
    }
}
