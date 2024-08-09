import { Component, OnInit } from '@angular/core';
import * as fromRootStore from '@core/store';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-whereabouts',
    templateUrl: 'whereabouts.component.html',
})
export class WhereaboutsComponent implements OnInit {
    constructor(private store: Store<fromRootStore.IState>) {}

    ngOnInit(): void {
        // code goes here
    }
}
