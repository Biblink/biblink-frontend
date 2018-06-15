import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FAQComponent } from './faq/faq.component';
import { SupportCenterComponent } from './support-center/support-center.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FAQComponent, SupportCenterComponent]
})
export class SupportModule { }
