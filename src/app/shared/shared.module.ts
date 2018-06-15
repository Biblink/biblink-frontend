import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedImportsModule } from './shared-imports/shared-imports.module';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedImportsModule
  ],
  declarations: [ FooterComponent ],
  exports: [ FooterComponent, SharedImportsModule ]
})
export class SharedModule { }
