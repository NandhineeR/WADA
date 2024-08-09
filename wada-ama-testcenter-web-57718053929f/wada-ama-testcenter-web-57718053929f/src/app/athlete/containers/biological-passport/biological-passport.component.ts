import { Component, OnInit } from '@angular/core';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-biological-passport',
    templateUrl: 'biological-passport.component.html',
})
export class BiologicalPassportComponent implements OnInit {
    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        // code goes here
    }
}
