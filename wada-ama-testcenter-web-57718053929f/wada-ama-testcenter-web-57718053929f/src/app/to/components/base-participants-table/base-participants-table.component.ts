import { Component, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { clone, find } from 'lodash-es';
import { ErrorEnum, TestingOrderMode, FieldError } from '@to/models';
import { isTimeFormatValid } from '@shared/utils/time-util';
import {
    DataSource,
    FieldsSecurity,
    GenericStatus,
    MAX_NUMBER_OF_ROWS,
    Participant,
    ParticipantTypeCode,
    SpecificCode,
    Status,
    TestParticipant,
} from '@shared/models';
import { isNullOrBlank, participantSuggestions } from '@shared/utils';
import { first, map } from 'rxjs/operators';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { TypeaheadComponent } from '@shared/components';
import { TableTranslationService } from '@shared/services';

@Component({
    selector: 'app-base-participants-table-component',
    template: '',
})
export class BaseParticipantsTable implements OnInit, OnDestroy {
    @ViewChildren(TypeaheadComponent) typeaheads?: QueryList<TypeaheadComponent>;

    @Input() emitSubmitData?: Subject<boolean>;

    fieldsSecurity$: Observable<FieldsSecurity | null> = this.store.select(fromStore.getFieldsSecurity);

    isEditMode$: Observable<boolean> = this.store.pipe(
        select(fromStore.getMode),
        map((mode) => mode === TestingOrderMode.Edit)
    );

    canAddRow = true;

    currentPerson = new Participant();

    currentTempId = '';

    dataSource = new DataSource(Array<TestParticipant>());

    participants: Array<Participant> = [];

    proposedStatus: GenericStatus | null = null;

    statuses: Status[] = [];

    subscriptions: Subscription = new Subscription();

    url: string | null = null;

    constructor(public store: Store<fromRootStore.IState>, public tableTranslationService: TableTranslationService) {}

    ngOnInit(): void {
        this.subscriptions.add(
            this.store
                .pipe(select(fromRootStore.getActiveRoute), first())
                .subscribe((route: fromRootStore.RouterStateUrl) => {
                    if (this.url === null) {
                        this.url = route.url;
                    }
                })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    addRow(testParticipant: TestParticipant): void {
        this.dataSource.data = [...this.dataSource.data, testParticipant];
        if (this.dataSource.data && this.dataSource.data.length >= MAX_NUMBER_OF_ROWS) this.canAddRow = false;
    }

    /**
     * Used in the template to set error CSS if a given arrivalTime has format errors
     * @param tempId
     * @returns
     */
    arrivalTimeHasError(tempId: string): boolean {
        return (
            find(this.arrivalTimeErrors, {
                inputId: `arrivalTime${tempId}`,
            }) !== undefined
        );
    }

    /**
     * Initializes the default generic status used for all participants with null status
     */
    buildDefaultParticipantStatus(): void {
        const proposed = this.statuses.find((status: Status) => status.specificCode === SpecificCode.NotProcessed);

        if (proposed) {
            this.proposedStatus = new GenericStatus({
                specificCode: SpecificCode.NotProcessed,
                description: proposed?.description || '',
                id: proposed?.id,
                ownerType: proposed?.ownerType || '',
            });
        }
    }

    /**
     * Filters out participants which have no type or no name and sets default value to participants with null status
     * @param testParticipants
     */
    cleanUpTestParticipants(testParticipants: Array<TestParticipant>): Array<TestParticipant> {
        const validTestParticipants = clone(testParticipants);
        validTestParticipants
            .filter((testParticipant) => testParticipant.type !== null && this.isNameSet(testParticipant))
            .forEach((p: TestParticipant) => {
                p.firstName = p.firstName?.trim() || '';
                p.lastName = p.lastName?.trim() || '';
            });
        this.setParticipantStatusToDefaultValue(validTestParticipants);

        return validTestParticipants;
    }

    /**
     * Finds dataSource row index giving tempId
     * @param tempId
     * @param type
     * @returns
     */
    findTestParticipantByTempId(tempId: string): Map<number, TestParticipant> {
        const indexParticipantPair = new Map();

        if (this.dataSource.data) {
            const dataCopy = [...this.dataSource.data];
            let participantIndex;
            const participant = dataCopy.find((aParticipant, index) => {
                participantIndex = index;
                return aParticipant.tempId === tempId;
            });

            indexParticipantPair.set(participantIndex, participant);
        }

        return indexParticipantPair;
    }

    getHeaderTranslation(header: string): string {
        let headerTranslation = '';
        this.subscriptions.add(
            this.tableTranslationService.translateHeader(header).subscribe((value: string) => {
                headerTranslation = value;
            })
        );
        return headerTranslation;
    }

    hasLeadDCOType(participant: TestParticipant) {
        return participant?.type?.code === ParticipantTypeCode.LEAD_DCO;
    }

    isNameSet(testParticipant: TestParticipant): boolean {
        return !(isNullOrBlank(testParticipant.lastName) && isNullOrBlank(testParticipant.firstName));
    }

    participantSuggestions = (token: string, index: number): Observable<Array<Participant> | null> => {
        if (this.participants.length > 0) {
            return participantSuggestions(
                token,
                this.currentPerson,
                this.participants,
                this.dataSource.data[index]?.type?.code === ParticipantTypeCode.LEAD_DCO || undefined
            );
        }
        return of([]);
    };

    /**
     * Used in the template to set error CSS if a given arrivalTime has format errors
     * @param tempId
     * @returns
     */
    participantTypeHasError(tempId: string): boolean {
        return (
            find(this.participantTypeErrors, {
                inputId: `participantType${tempId}`,
            }) !== undefined
        );
    }

    updateDataSource(index: number, updatedTestParticipant: TestParticipant): void {
        if (this.dataSource.data[index]) {
            this.dataSource.data[index].activePersonId = updatedTestParticipant.activePersonId;
            this.dataSource.data[index].tempId = updatedTestParticipant.tempId;
            this.dataSource.data[index].arrivalHour = updatedTestParticipant.arrivalHour;
            this.dataSource.data[index].arrivalMinute = updatedTestParticipant.arrivalMinute;
            this.dataSource.data[index].comment = updatedTestParticipant.comment;
            this.dataSource.data[index].firstName = updatedTestParticipant.firstName;
            this.dataSource.data[index].lastName = updatedTestParticipant.lastName;
            this.dataSource.data[index].lastStatusChange = updatedTestParticipant.lastStatusChange;
            this.dataSource.data[index].status = updatedTestParticipant.status;
            this.dataSource.data[index].type = updatedTestParticipant.type;
        }
    }

    private setParticipantStatusToDefaultValue(testParticipants: Array<TestParticipant> = []): void {
        testParticipants.forEach((testParticipant: TestParticipant) => {
            testParticipant.status = testParticipant.status || this.proposedStatus;
        });
    }

    get arrivalTimeErrors(): FieldError[] {
        return this.dataSource.data
            .filter(
                (testParticipant: TestParticipant) =>
                    !isNullOrBlank(testParticipant.arrivalTime) && !isTimeFormatValid(testParticipant.arrivalTime)
            )
            .map(
                (testParticipant) =>
                    new FieldError({
                        code: ErrorEnum.arrivalTime,
                        hasError: true,
                        inputId: `arrivalTime${testParticipant.tempId}`,
                    })
            );
    }

    get participantTypeErrors(): FieldError[] {
        return this.dataSource.data
            .filter(
                (testParticipant: TestParticipant) => testParticipant.type === null && this.isNameSet(testParticipant)
            )
            .map(
                (testParticipant) =>
                    new FieldError({
                        code: ErrorEnum.participantType,
                        hasError: true,
                        inputId: `participantType${testParticipant.tempId}`,
                    })
            );
    }
}
