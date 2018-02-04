import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

declare const AOS: any;
@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

    constructor(public title: Title) {
        this.title.setTitle('Biblya | Sign In');
    }

    ngOnInit() {
        AOS.init({
            disable: 'mobile'
        });
    }

}
