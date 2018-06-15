import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TermsOfUseComponent, PrivacyPolicyComponent]
})
export class LegalModule { }
