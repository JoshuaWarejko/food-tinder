import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'app-chosen-location-modal',
    templateUrl: 'chosen-location.html'
})
export class ChosenLocationPage {
    chosenLocation: any;
    constructor(params: NavParams, public viewCtrl: ViewController) {
        this.chosenLocation = params.get('chosenLocation');
    }
    closeModal(chosenLocation) {
        this.viewCtrl.dismiss(chosenLocation);
    }
}