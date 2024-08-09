import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterStateUrl } from '@core/store';
import { FieldsSecurity, TOActionRight } from '@shared/models';
import { Observable } from 'rxjs';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { TestingOrderMode } from '@to/models';

@Component({
    selector: 'app-add-athlete-controls',
    templateUrl: './add-athlete-controls.component.html',
    styleUrls: ['./add-athlete-controls.component.scss'],
})
export class AddAthleteControlsComponent {
    routeState: RouterStateUrl | null = null;

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    inCreation$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Create)
    );

    actionRight = TOActionRight;

    constructor(private store: Store<fromRootStore.IState>) {}

    @Input() set route(routeState: RouterStateUrl) {
        this.routeState = routeState;
    }

    @Output()
    readonly submitStep: EventEmitter<boolean> = new EventEmitter<boolean>();

    submit(): void {
        this.submitStep.emit(true);
    }
}
