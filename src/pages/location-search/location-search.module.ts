import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { LocationSearchPage } from './location-search';

@NgModule({
  declarations: [
    LocationSearchPage
  ],
  imports: [
    IonicPageModule.forChild(LocationSearchPage)
  ],
  exports: [
    LocationSearchPage
  ],
  entryComponents: []
})
export class LocationSearchPageModule { }
