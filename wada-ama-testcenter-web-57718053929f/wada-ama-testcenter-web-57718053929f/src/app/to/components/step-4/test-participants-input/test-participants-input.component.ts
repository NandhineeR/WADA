import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import {
    Participant,
    ParticipantType,
    ParticipantTypeCode,
    Status,
    TestParticipant,
    TOActionRight,
    TOFormControls,
    ColumnDef,
    MAX_NUMBER_OF_ROWS,
} from '@shared/models';
import { clone } from 'lodash-es';
import * as fromRootStore from '@core/store';
import * as fromStore from '@to/store';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged, filter, first } from 'rxjs/operators';
import { TableTranslationService } from '@shared/services';
import { TypeaheadComponent } from '@shared/components';
import { stringToHourMinute } from '@shared/utils/time-util';
import { BaseParticipantsTable } from '@to/components/base-participants-table/base-participants-table.component';

@Component({
    selector: 'app-test-participants-input',
    templateUrl: './test-participants-input.component.html',
    styleUrls: ['./test-participants-input.component.scss'],
})
export class TestParticipantsInputComponent extends BaseParticipantsTable implements AfterViewInit {
    readonly actionRight = TOActionRight;

    readonly controls = TOFormControls;

    @Output()
    readonly submitData: EventEmitter<TestParticipant[]> = new EventEmitter<TestParticipant[]>();

    @Input() bloodOfficials?: Array<Participant>;

    @Input() chaperones?: Array<Participant>;

    @Input() hasAccessToTestParticipants = false;

    @Input() moParticipants?: Array<Participant>;

    @Input() participantTypes?: Array<ParticipantType>;

    @Input() set participantStatuses(participantStatuses: Array<Status>) {
        this.statuses = participantStatuses;
        this.buildDefaultParticipantStatus();
    }

    @Input() set testParticipants(testParticipants: Array<TestParticipant>) {
        this.dataSource.data = testParticipants;
        this.initializeTable();
    }

    @Input() witnessChaperones?: Array<Participant>;

    columns: Array<Partial<ColumnDef<TestParticipant>>> = [
        {
            key: 'type',
            header: this.getHeaderTranslation('type'),
            cell: (e) => e.type,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: 'lastName',
            header: this.getHeaderTranslation('lastName'),
            cell: (e) => e.lastName,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: 'firstName',
            header: this.getHeaderTranslation('firstName'),
            cell: (e) => e.firstName,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: 'arrivalTime',
            header: this.getHeaderTranslation('arrivalTime'),
            cell: (e) => e.arrivalTime,
            mandatory: true,
            wrapContain: true,
            columnWidth: true,
        },
        {
            key: 'status',
            header: this.getHeaderTranslation('status'),
            cell: (e) => e.status,
            mandatory: true,
            wrapContain: true,
        },
        {
            key: 'comment',
            header: this.getHeaderTranslation('comment'),
            cell: (e) => e.comment,
            mandatory: true,
            wrapContain: true,
        },
    ];

    constructor(public store: Store<fromRootStore.IState>, public tableTranslationService: TableTranslationService) {
        super(store, tableTranslationService);
    }

    ngAfterViewInit(): void {
        if (this.emitSubmitData) {
            this.subscriptions.add(
                this.emitSubmitData.subscribe(() => {
                    this.submitDataSource();
                })
            );
        }

        this.subscriptions.add(
            this.store
                .select(fromStore.getSubmitCurrentStep)
                .pipe(distinctUntilChanged(), filter(Boolean))
                .subscribe(() => this.submitDataSource())
        );
    }

    addTestParticipant(): void {
        this.addRow(new TestParticipant());
    }

    deleteRow(testParticipant: TestParticipant): void {
        const idx = this.dataSource.data.findIndex(
            (participant: TestParticipant) => testParticipant.tempId === participant.tempId
        );
        const dataCopy = [...this.dataSource.data];
        dataCopy.splice(idx, 1);
        this.dataSource.data = dataCopy;
        if (this.dataSource.data.length < MAX_NUMBER_OF_ROWS) {
            this.canAddRow = true;
        }

        this.runValidations();
    }

    /**
     * Re-runs participant validations if the user updates the last name of the participant after selecting it from the typeahead dropdown
     * inputBlur event is triggered before selected event, so the timeout allows participantSelected() to be executed before validateParticipantSelected()
     * @param tempId - the id of the updated participant in the table
     */
    onLastNameInputBlur(tempId: string) {
        setTimeout(() => {
            this.validateParticipantSelected(tempId);
        }, 250);
    }

    /**
     * Called by the onblur event on the arrival time field
     * @param arrivalTime
     * @param tempId
     * @param type
     */
    onLeaveArrivalTime(arrivalTime: string, tempId: string): void {
        const [index, currentParticipant] = this.findTestParticipantByTempId(tempId).entries().next().value;
        const updatedParticipant = this.updateParticipantArrivalTime(currentParticipant, arrivalTime);
        this.updateDataSource(index, updatedParticipant);
        this.runValidations();
    }

    participantSelected(participant: Participant): void {
        if (participant) {
            const [index, currentParticipant] = this.findTestParticipantByTempId(this.currentTempId)
                .entries()
                .next().value;
            const updatedParticipant: TestParticipant = clone(currentParticipant);
            updatedParticipant.firstName = participant.firstName?.trim() || '';
            updatedParticipant.lastName = participant.lastName?.trim() || '';
            updatedParticipant.activePersonId = participant.activePersonId;
            this.updateDataSource(index, updatedParticipant);
        } else {
            this.validateParticipantSelected(this.currentTempId);
        }
    }

    /**
     * Assign the suitable array of available participants according to the selected participant type
     * @param participantType
     * @param tempId
     */
    setParticipantsGivenType(participantType: ParticipantType | null, tempId: string): void {
        // if role (type) is not selected, list of person Suggestions is empty
        this.currentTempId = tempId;
        if (participantType) {
            switch (participantType.code) {
                case ParticipantTypeCode.CHAPERONE:
                    this.participants = this.chaperones || [];
                    break;
                case ParticipantTypeCode.URINE_WITNESS:
                    this.participants = this.witnessChaperones || [];
                    break;
                case ParticipantTypeCode.BLOOD_OFFICER:
                    this.participants = this.bloodOfficials || [];
                    break;
                case ParticipantTypeCode.ATHLETE_REPRESENTATIVE:
                case ParticipantTypeCode.DOCTOR:
                case ParticipantTypeCode.COACH:
                case ParticipantTypeCode.IF:
                case ParticipantTypeCode.OTHER:
                case ParticipantTypeCode.MAJOR_GAME_REPRESENTATIVE:
                    this.participants = this.moParticipants || [];
                    break;
                default:
                    break;
            }
        } else {
            this.participants = [];
        }
    }

    submitDataSource(): void {
        this.submitData.emit(this.cleanUpTestParticipants(this.dataSource.data));
    }

    runValidations(): void {
        this.store.pipe(select(fromStore.shouldSavingBeDisabled), first()).subscribe((disableSaving: boolean) => {
            if (this.isStepInError !== disableSaving) {
                this.store.dispatch(fromStore.SetDisableSaving({ disableSaving: this.isStepInError }));
            }
        });
    }

    validateParticipantSelected(tempId: string): void {
        const [index, currentParticipant] = this.findTestParticipantByTempId(tempId).entries().next().value;
        const updatedParticipant = clone(currentParticipant);
        if (!this.isParticipantSelectedFromSuggestions(tempId)) {
            updatedParticipant.activePersonId = null;
            updatedParticipant.firstName = updatedParticipant.firstName?.trim() || '';
            updatedParticipant.lastName = updatedParticipant.lastName?.trim() || '';
            this.updateDataSource(index, updatedParticipant);
        }
        this.runValidations();
    }

    private initializeTable(): void {
        if (this.dataSource.data.length === 0) {
            this.addTestParticipant();
        }
    }

    /**
     * Check if there is any person selected from suggestions list
     * (LastName and FirstName inputs must match with a participant in this.participants)
     * @param tempId
     * @returns
     */
    private isParticipantSelectedFromSuggestions(tempId: string): boolean {
        if (this.typeaheads && document) {
            const firstName = (document.querySelector(`#firstName${tempId}`) as HTMLInputElement)?.value?.trim() || '';
            const lastName =
                this.typeaheads
                    .find((item: TypeaheadComponent) => item.fieldId === `lastName${tempId}`)
                    ?.value?.trim() || '';
            return (
                (this.participants || []).find((person) =>
                    this.namesEqual(person, new Participant({ firstName, lastName }))
                ) !== undefined
            );
        }
        return false;
    }

    private namesEqual(p1: Participant, p2: Participant): boolean {
        const { firstName: f1 = '', lastName: l1 = '' } = p1;
        const { firstName: f2 = '', lastName: l2 = '' } = p2;

        return (
            f1.trim().toLocaleLowerCase() === f2.trim().toLocaleLowerCase() &&
            l1.trim().toLocaleLowerCase() === l2.trim().toLocaleLowerCase()
        );
    }

    private updateParticipantArrivalTime(currentParticipant: TestParticipant, arrivalTime: string): TestParticipant {
        const updatedParticipant = clone(currentParticipant);
        const time = stringToHourMinute(arrivalTime);

        updatedParticipant.arrivalHour = time[0] !== undefined ? time[0] : null;
        updatedParticipant.arrivalMinute = time[1] !== undefined ? time[1] : null;

        return updatedParticipant;
    }

    get isStepInError(): boolean {
        return this.arrivalTimeErrors.length > 0 || this.participantTypeErrors.length > 0;
    }
}
