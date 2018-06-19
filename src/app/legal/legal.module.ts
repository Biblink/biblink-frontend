import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LegalRoutingModule } from './legal-routing.module';

@NgModule({
  imports: [
    CommonModule,
    LegalRoutingModule
  ],
  declarations: [ TermsOfUseComponent, PrivacyPolicyComponent ]
})
export class LegalModule { }
