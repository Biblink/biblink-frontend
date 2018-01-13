import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
    searchQuery = '';
    suggestions: String[] = ['Leviticus', 'Love', 'Life'];

    constructor(private title: Title) {
    }

    ngOnInit() {
        this.title.setTitle('Biblya | Search');
    }

}
