import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CanComponentDeactivate } from '@shared/guards';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { DopingControlPersonnelInformation } from '@to/models';
import { ConflictException } from '@core/models';
import { ListItem, Participant, ParticipantType, Status, TestParticipant } from '@shared/models';
import { CanDeactivate } from '@angular/router';

@Component({
    selector: 'app-step-3',
    templateUrl: './step-3.component.html',
    styleUrls: ['./step-3.component.scss'],
})
export class Step3Component implements CanDeactivate<CanComponentDeactivate>, OnInit, OnDestroy {
    dcos$: Observable<Array<Participant>> = this.store.select(fromAutoCompletesStore.getAutoCompletesDcos);

    dcpParticipants$: Observable<Array<TestParticipant> | null> = this.store.select(fromStore.getTODcpParticipants);

    instructions$: Observable<string | null> = this.store.select(fromStore.getTOInstructions);

    participantStatuses$: Observable<Array<Status>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesParticipantStatuses
    );

    participantTypes$: Observable<Array<ParticipantType> | null> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesParticipantTypes
    );

    conflictException: ConflictException | undefined = undefined;

    emitSubmitData: Subject<boolean> = new Subject();

    hasOptimisticLockException = false;

    hasSaveConflict = false;

    isSCA = false;

    saveError = false;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        this.emitSubmitData.next(true);
        return true;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step3Init());

        this.subscriptions.add(
            combineLatest([
                this.store.select(fromStore.getTOSampleCollectionAuthority),
                this.store.select(fromRootStore.getOrganizationAsListItem),
            ])
                .pipe(
                    filter(([sca, userOrganization]: [ListItem | null, ListItem | null]) => {
                        return sca && userOrganization && sca.id && userOrganization.id
                            ? Boolean(sca.id === userOrganization.id)
                            : false;
                    })
                )
                .subscribe(() => {
                    this.isSCA = true;
                })
        );

        this.subscriptions.add(
            this.store
                .select(fromStore.getConflictException)
                .subscribe((conflictException: ConflictException | undefined) => {
                    this.hasSaveConflict = Boolean(conflictException);
                    this.conflictException = conflictException;
                    if (conflictException) {
                        this.hasOptimisticLockException = conflictException.hasOptimisticLockException();
                    }
                })
        );

        this.subscriptions.add(
            this.store.select(fromStore.getError).subscribe((error: boolean | null) => {
                this.saveError = Boolean(error);
            })
        );
    }

    submitData(dopingControlPersonnel: DopingControlPersonnelInformation): void {
        this.store.dispatch(fromStore.Step3SubmitForm({ values: dopingControlPersonnel }));
    }
}
