import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as fromAutoCompletesStore from '@autocompletes/store';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { ListItem, Participant, ParticipantType, Status, TestParticipant } from '@shared/models';
import { filter, map } from 'rxjs/operators';
import { CanDeactivate } from '@angular/router';
import { CanComponentDeactivate } from '@shared/guards';
import { TestParticipantsInformation } from '@to/models';

@Component({
    selector: 'app-step-4',
    templateUrl: './step-4.component.html',
    styleUrls: ['./step-4.component.scss'],
})
export class Step4Component implements CanDeactivate<CanComponentDeactivate>, OnInit {
    bloodOfficials$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesBloodOfficials
    );

    chaperones$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesNotifyingChaperones
    );

    moParticipant$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesMOParticipants
    );

    participantStatuses$: Observable<Array<Status>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesParticipantStatuses
    );

    participantTypes$: Observable<Array<ParticipantType> | null> = this.store.pipe(
        select(fromAutoCompletesStore.getAutoCompletesParticipantTypes),
        map((types: ParticipantType[]) => types.filter((type) => !type.code?.includes(Object.freeze('DCO'))))
    );

    testParticipants$: Observable<Array<TestParticipant> | null> = this.store.select(fromStore.getTOTestParticipants);

    witnessChaperones$: Observable<Array<Participant>> = this.store.select(
        fromAutoCompletesStore.getAutoCompletesWitnessChaperones
    );

    emitSubmitData: Subject<boolean> = new Subject();

    isSCA = false;

    private subscriptions = new Subscription();

    constructor(private store: Store<fromRootStore.IState>) {}

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        this.emitSubmitData.next(true);
        return true;
    }

    ngOnInit(): void {
        this.store.dispatch(fromStore.Step4Init());

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
    }

    submitData(testParticipants: TestParticipant[]): void {
        this.store.dispatch(
            fromStore.Step4SubmitForm({ values: new TestParticipantsInformation({ testParticipants }) })
        );
    }
}
