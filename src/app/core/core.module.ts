import {
  NgModule,
  Optional,
  SkipSelf,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchService } from './services/search/search.service';
import { AuthService } from './services/auth/auth.service';
import { UserDataService } from './services/user-data/user-data.service';
import { MessagingService } from './messaging/messaging.service';
import { ToastrService } from 'ngx-toastr';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [
    UserDataService,
    AuthService,
    SearchService,
    MessagingService,
    ToastrService
  ]
})
export class CoreModule {
  /* make sure CoreModule is imported only by one NgModule the AppModule */
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule  is already loaded. Import only in AppModule'
      );
    }
  }
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }
}
