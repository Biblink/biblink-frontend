import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Verse} from './types/verse.type';

@Injectable()
export class SearchService {
    results: Verse[] = [];
    searchUrl: string;
    constructor(private http: HttpClient) {
        this.searchUrl = environment.es_url;
    }

    searchES(query) {
        this.http.get(`${this.searchUrl}/search?term=${query}`).subscribe(res => {
            this.results = res['results'] as Verse[];
        });
    }
}
