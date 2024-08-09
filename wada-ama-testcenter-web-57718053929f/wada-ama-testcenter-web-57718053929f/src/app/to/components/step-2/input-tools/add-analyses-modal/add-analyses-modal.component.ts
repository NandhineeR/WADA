import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import { map } from 'rxjs/operators';
import { AddAnalysesTableComponent } from './add-analyses-table/add-analyses-table.component';

@Component({
    selector: 'app-add-analyses-modal',
    templateUrl: './add-analyses-modal.component.html',
    styleUrls: ['./add-analyses-modal.component.scss'],
})
export class AddAnalysesModalComponent {
    @ViewChild(AddAnalysesTableComponent, { static: true })
    set addAnalysesComponent(addAnalysesComponent: AddAnalysesTableComponent) {
        this.isSearchAthlete = addAnalysesComponent.isSearchAthlete;
        this.isPlaceholder = addAnalysesComponent.isPlaceholder;
        this.isEditAnalyses = addAnalysesComponent.isEditAnalyses;
        this.isAddAnalyses = !this.isSearchAthlete && !this.isPlaceholder && !this.isEditAnalyses;
        this.isModalLocked = Boolean(this.isSearchAthlete);
    }

    removeTestRows = false;

    isSearchAthlete = false;

    isPlaceholder = false;

    isEditAnalyses = false;

    isAddAnalyses = false;

    isModalLocked = false;

    urlWithoutParenthesis$: Observable<string> = this.store.pipe(
        select(fromRootStore.getActiveRouteUrlWithoutParenthesis())
    );

    route$: Observable<string> = this.store
        .select(fromRootStore.getActiveRouteUrl)
        .pipe(map((url) => url.split('#')[0]));

    constructor(private store: Store<fromRootStore.IState>) {}

    removeTests(): void {
        // Gives the command, so the Add Analyses can delete all test rows
        this.removeTestRows = true;
        // Unlocks Add Analyses Modal, so it can be closed after test rows are removed
        this.isModalLocked = false;
    }
}
