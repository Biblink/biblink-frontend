import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { ShareModule } from '@ngx-share/core';
import { SharedImportsModule } from './../shared/shared-imports/shared-imports.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.page';
import { Angulartics2Module } from 'angulartics2';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ScrollToModule,
    Angulartics2Module,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule { }
