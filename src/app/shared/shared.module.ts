import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedImportsModule } from './shared-imports/shared-imports.module';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { DropZoneDirective } from './directives/drop-zone.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedImportsModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    FileUploadComponent,
    LoadingSpinnerComponent,
    SafeHtmlPipe,
    DropZoneDirective
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    FileUploadComponent,
    LoadingSpinnerComponent,
    SafeHtmlPipe,
    DropZoneDirective,
    SharedImportsModule
  ]
})
export class SharedModule { }
