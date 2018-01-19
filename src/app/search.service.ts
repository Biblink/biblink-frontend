import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Verse} from './types/verse.type';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SearchService {
    results: Verse[] = [];
    searchUrl: string;
    constructor(private http: HttpClient) {
        this.searchUrl = environment.es_url;
    }

    searchES(query, sort_type = 'relevant') {
        this.http.get(`${this.searchUrl}/search?term=${query}&sort_type=${sort_type}`).subscribe(res => {
            this.results = res['results'] as Verse[];
        });
    }

    getSimilarVerses(reference: string): Observable<any> {
        return this.http.get(`${this.searchUrl}/similarity?reference=${reference}`);
    }
}
