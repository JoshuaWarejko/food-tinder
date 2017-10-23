import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { LocationsPage } from './locations';

@NgModule({
  declarations: [
    LocationsPage
  ],
  imports: [
    IonicPageModule.forChild(LocationsPage),
    TranslateModule.forChild()
  ],
  exports: [
    LocationsPage
  ],
  entryComponents: []
})
export class LocationsPageModule { }
