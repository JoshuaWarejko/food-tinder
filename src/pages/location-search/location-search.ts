import { Component } from '@angular/core';
import { IonicPage, LoadingController } from 'ionic-angular';

import { LocationsApi } from '../../providers/locationsApi/locationsApi';

@IonicPage()
@Component({
    selector: 'page-location-search',
    templateUrl: 'location-search.html'
})
export class LocationSearchPage {
    
    search: {term: any, location: any};
    results: any;
    submitted: Boolean;
    loading: any;
    
    constructor(
        public locationsApi: LocationsApi,
        public loadingCtrl: LoadingController
    ) {
        this.search = {term: "", location: ""};
        this.submitted = false;
        this.loading = this.loadingCtrl.create({content: "Searching for locations..."});
    }
    
    onSearchLocationSubmit() {
        this.loading.present();
        this.submitted = true;
        this.results = null;
        this.locationsApi.searchLocations({term: this.search.term, location: this.search.location})
        .subscribe(res => {   
            this.results = res['businesses'];
            this.loading.dismiss();
        }, err => {
            console.log('Location Search Error: ', err);
            this.loading.dismiss();
        });
    }
}