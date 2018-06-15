import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdatesAndReleasesComponent } from './updates-and-releases/updates-and-releases.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [UpdatesAndReleasesComponent, ContactComponent]
})
export class OrganizationModule { }
