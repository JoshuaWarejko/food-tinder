import { Component } from '@angular/core';
import { IonicPage, ModalController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { LocationsApi } from '../../providers/locationsApi/locationsApi';
import { ChosenLocationPage } from '../chosen-location/chosen-location';

@IonicPage()
@Component({
    selector: 'page-locations',
    templateUrl: 'locations.html'
})
export class LocationsPage {
    
    results: any;
    activeLocation: any;
    activeIndex: any;
    chosenLocations: any[];
    nonChosenLocations: any[];
    submitted: Boolean;
    modalRef: any;
    position: {latitude: Number, longitude: Number};
    loading: any;
    
    constructor(
        public locationsApi: LocationsApi, 
        public modalCtrl: ModalController, 
        private geolocation: Geolocation,
        public loadingCtrl: LoadingController
    ) {
        this.position = {latitude: null, longitude: null};
        this.submitted = false;
        this.chosenLocations = [];
        this.nonChosenLocations = [];
        this.loading = this.loadingCtrl.create({content: "Loading locations near you..."});
        this.loading.present();
        
        if ((<any>window).cordova) {
            // running on device/emulator
            this.geolocation.getCurrentPosition().then((res) => {
                this.position.latitude = res.coords.latitude;
                this.position.longitude = res.coords.longitude;
                this.loadLocations(this.position.latitude, this.position.longitude);
            }).catch((error) => {
                console.error('Error getting location: ', error);
            });
            let watch = this.geolocation.watchPosition();
            watch.subscribe((data) => {
                if(data.coords !== undefined) {
                    // data can be a set of coordinates, or an error (if an error occurred).
                    this.position.latitude = data.coords.latitude;
                    this.position.longitude = data.coords.longitude;
                    this.loadLocations(this.position.latitude, this.position.longitude);
                } else {
                    console.error("An error occurred: ", data);
                }
            });
        } else {
            // Runs when in browser / dev mode
            // Check if Geolocation is supported. If supported then run getCurrentPosition().
            // If not supported, display error message in console.
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((res) => {
                    this.position.latitude = res.coords.latitude;
                    this.position.longitude = res.coords.longitude;
                    this.loadLocations(this.position.latitude, this.position.longitude);
                }, this.showGeoError);
            } else {
                console.warn('Geolocation is not supported by this browser.');
            }
        }
        
    }
    
    loadLocations(lat, long) {
        this.locationsApi.getLocations({latitude: lat, longitude: long}).subscribe(res => {
            this.activeLocation = {};
            this.activeIndex = 0;
            this.results = res['data']['businesses'];
            this.activeLocation = this.results[this.activeIndex];
            this.loading.dismiss();
        }, err => {
            console.log(err);
        });
    }
    
    showGeoError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
            console.error('User denied the request for Geolocation.');
            break;
            case error.POSITION_UNAVAILABLE:
            console.error('Location information is unavailable.');
            break;
            case error.TIMEOUT:
            console.error('The request to get user location timed out.');
            break;
            case error.UNKNOWN_ERROR:
            console.error('An unknown error occurred.');
            break;
        }
    }
    
    chooseYes() {
        this.chosenLocations.push(this.activeLocation);
        this.activeLocation = this.results[++this.activeIndex];
        if(this.activeIndex % 5 == 0) {
            const chosenIndex = Math.floor(Math.random() * this.chosenLocations.length);
            this.openModal(chosenIndex);
        }
    }
    
    chooseNo() {
        this.nonChosenLocations.push(this.activeLocation);
        this.activeLocation = this.results[++this.activeIndex];
    }
    
    openModal(chosenIndex) {
        let modal = this.modalCtrl.create(ChosenLocationPage, {
            chosenLocation: this.chosenLocations[chosenIndex]
        });
        modal.onDidDismiss(data => {
            console.log('The dismissed data: ', data);
        });
        modal.present();
    }
}