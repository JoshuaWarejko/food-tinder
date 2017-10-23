import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ChosenLocationPage } from './chosen-location';

@NgModule({
  declarations: [
    ChosenLocationPage
  ],
  imports: [
    IonicPageModule.forChild(ChosenLocationPage),
    TranslateModule.forChild()
  ],
  exports: [
    ChosenLocationPage
  ],
  entryComponents: []
})
export class LocationsPageModule { }
