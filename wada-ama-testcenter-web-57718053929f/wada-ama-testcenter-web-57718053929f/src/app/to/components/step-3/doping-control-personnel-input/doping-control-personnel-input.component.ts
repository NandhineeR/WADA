import {
    ColumnDef,
    MAX_NUMBER_OF_ROWS,
    MAXIMUM_LEAD_DCOS,
    Participant,
    ParticipantType,
    ParticipantTypeCode,
    SpecificCode,
    Status,
    TestParticipant,
    TOActionRight,
    TOFormControls,
} from '@shared/models';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslationMap, TranslationService } from '@core/services';
import { select, Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import { TableTranslationService } from '@shared/services/table-translation.service';
import { DopingControlPersonnelInformation } from '@to/models';
import { distinctUntilChanged, filter, first } from 'rxjs/operators';
import * as fromStore from '@to/store';
import { TypeaheadComponent } from '@shared/components';
import { stringToHourMinute, isNullOrBlank } from '@shared/utils';
import { clone, isEqual } from 'lodash-es';
import { BaseParticipantsTable } from '@to/components/base-participants-table/base-participants-table.component';
import { reorderDcpParticipantsList } from '@to/store/mapper/selector.mapper';

@Component({
    selector: 'app-doping-control-personnel-input',
    templateUrl: './doping-control-personnel-input.component.html',
    styleUrls: ['./doping-control-personnel-input.component.scss'],
})
export class DopingControlPersonnelInputComponent
    extends BaseParticipantsTable
    implements AfterViewInit, OnChanges, OnInit {
    readonly actionRight = TOActionRight;

    readonly controls = TOFormControls;

    @Output()
    readonly submitData: EventEmitter<DopingControlPersonnelInformation> = new EventEmitter<DopingControlPersonnelInformation>();

    @Input() set dcos(dcos: Array<Participant>) {
        this.participants = dcos;
    }

    @Input() set dcpParticipants(dcpParticipants: Array<TestParticipant>) {
        this.dataSource.data = reorderDcpParticipantsList(dcpParticipants);
    }

    @Input() hasAccessToDCP = false;

    @Input() set instructions(instructions: string) {
        this.instructionsInput = instructions;
    }

    get instructions() {
        return this.instructionsInput;
    }

    @Input() set participantStatuses(participantStatuses: Array<Status>) {
        this.statuses = participantStatuses;
    }

    @Input() set participantTypes(participantTypes: Array<ParticipantType>) {
        this._participantTypes = participantTypes.filter((type) =>
            type.code?.toLowerCase().includes(Object.freeze('DCO').toLowerCase())
        );
    }

    get participantTypes(): ParticipantType[] {
        return this._participantTypes;
    }

    @Input() suggestionsLimit = 300;

    instructionsInput = '';

    leadDCOType: ParticipantType | null = null;

    translatedLeadDCOTypeDescription = '';

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

    private _participantTypes: Array<ParticipantType> = [];

    constructor(
        public store: Store<fromRootStore.IState>,
        public tableTranslationService: TableTranslationService,
        private translationService: TranslationService
    ) {
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

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.participantStatuses?.currentValue?.length > 0) {
            this.buildDefaultParticipantStatus();

            if (this.dataSource.data?.length > 0) {
                this.assignDefaultStatusToLeadDCO();
            }
        }

        if (changes.participantTypes?.currentValue?.length > 0) {
            this.buildLeadDCOParticipantType();

            if (this.dataSource.data?.length === 0) {
                this.initializeTable();
            }

            this.assignLeadDCOParticipantTypeToLeadDCO();
        }
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.translationService.translations$.subscribe((translations: TranslationMap) => {
                this.translatedLeadDCOTypeDescription =
                    translations[
                        this.translationService.getParticipantTypeKey(ParticipantTypeCode.LEAD_DCO.toString())
                    ];
            })
        );
    }

    addDopingControlPersonnel(): void {
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

    participantSelected(participant: Participant, tempId: string): void {
        if (participant) {
            const [index, currentParticipant] = this.findTestParticipantByTempId(tempId).entries().next().value;
            const updatedParticipant: TestParticipant = clone(currentParticipant);
            updatedParticipant.firstName = participant.firstName;
            updatedParticipant.lastName = participant.lastName;
            updatedParticipant.activePersonId = participant.activePersonId;
            this.updateDataSource(index, updatedParticipant);
        } else {
            this.validateParticipantSelected(tempId);
        }
    }

    runValidations(): void {
        this.store.pipe(select(fromStore.shouldSavingBeDisabled), first()).subscribe((disableSaving: boolean) => {
            if (this.isStepInError !== disableSaving) {
                this.store.dispatch(fromStore.SetDisableSaving({ disableSaving: this.isStepInError }));
            }
        });
    }

    submitDataSource(): void {
        const dopingControlPersonnel: DopingControlPersonnelInformation = new DopingControlPersonnelInformation();
        dopingControlPersonnel.dcpParticipants = this.cleanUpTestParticipants(this.dataSource.data);
        dopingControlPersonnel.instructions = this.instructionsInput;

        this.submitData.emit(dopingControlPersonnel);
    }

    updateInstructions(newInstructions: string): void {
        this.instructionsInput = newInstructions;
    }

    validateParticipantSelected(tempId: string): void {
        const [index, currentParticipant] = this.findTestParticipantByTempId(tempId).entries().next().value;
        const updatedParticipant = clone(currentParticipant);
        if (!this.isParticipantSelectedFromSuggestions(tempId)) {
            updatedParticipant.activePersonId = null;
            updatedParticipant.firstName = null;
            updatedParticipant.lastName = null;
            updatedParticipant.lastStatusChange = null;
            this.updateDataSource(index, updatedParticipant);
        }
        this.runValidations();
    }

    private assignDefaultStatusToLeadDCO() {
        const leadDCOWithNullStatus = this.dataSource.data.find(
            (participant) => this.hasLeadDCOType(participant) && participant.status === null
        );
        if (leadDCOWithNullStatus) leadDCOWithNullStatus.status = this.proposedStatus;
    }

    private assignLeadDCOParticipantTypeToLeadDCO(): void {
        const leadDCOWithNullType = this.dataSource.data.find(
            (participant) => this.hasLeadDCOType(participant) && participant.status === null
        );

        if (leadDCOWithNullType) leadDCOWithNullType.status = this.proposedStatus;
    }

    private buildLeadDCOParticipantType(): void {
        const leadDCOType = this.participantTypes.find(
            (type: ParticipantType) => type.code?.toLowerCase() === ParticipantTypeCode.LEAD_DCO.toLowerCase()
        );

        if (leadDCOType) {
            this.leadDCOType = new ParticipantType({
                code: leadDCOType.code,
                description: leadDCOType.description,
            });
        } else {
            this.leadDCOType = new ParticipantType({
                code: ParticipantTypeCode.LEAD_DCO,
                description: this.translatedLeadDCOTypeDescription,
            });
            this.participantTypes.push(this.leadDCOType);
        }
    }

    private hasRejectedStatus(participant: TestParticipant) {
        return (
            !isNullOrBlank(participant?.status?.specificCode) &&
            participant?.status?.specificCode === SpecificCode.Rejected
        );
    }

    private initializeTable(): void {
        if (this.dataSource.data?.length === 0) {
            const leadDCOParticipant = new TestParticipant({
                type: this.leadDCOType,
                status: this.proposedStatus,
            });

            this.addRow(leadDCOParticipant);
        }
    }

    /**
     * Check if there is any person selected from suggestions list
     * (LastName and FirstName inputs must match with a participant in this.participants)
     * @param tempId
     * @returns
     */
    private isParticipantSelectedFromSuggestions(tempId: string): boolean {
        let isParticipantSelectedFromList = false;
        if (this.typeaheads && document) {
            const typeahead = this.typeaheads.find((item: TypeaheadComponent) => item.fieldId === `lastName${tempId}`);
            const lastName = typeahead && typeahead.value;
            const firstName = (document.querySelector(`#firstName${tempId}`) as HTMLInputElement).value;
            const participantSelected = (this.participants || []).find(
                (person) => isEqual(person.firstName, firstName) && isEqual(person.lastName, lastName)
            );
            isParticipantSelectedFromList = participantSelected !== undefined;
        }
        return isParticipantSelectedFromList;
    }

    private updateParticipantArrivalTime(currentParticipant: TestParticipant, arrivalTime: string): TestParticipant {
        const updatedParticipant = clone(currentParticipant);
        const time = stringToHourMinute(arrivalTime);

        updatedParticipant.arrivalHour = time[0] !== undefined ? time[0] : null;
        updatedParticipant.arrivalMinute = time[1] !== undefined ? time[1] : null;

        return updatedParticipant;
    }

    private validateLeadDCOStatusError(): boolean {
        const activeLeadDCOs = this.dataSource.data.filter(
            (participant: TestParticipant) => this.hasLeadDCOType(participant) && !this.hasRejectedStatus(participant)
        );

        return activeLeadDCOs.length > MAXIMUM_LEAD_DCOS;
    }

    private validateLeadDCOStatusWarning(): boolean {
        const leadDCOsWithNoStatus = this.dataSource.data.filter(
            (participant: TestParticipant) =>
                this.hasLeadDCOType(participant) && !participant.status && this.isNameSet(participant)
        );
        return leadDCOsWithNoStatus.length > 0;
    }

    get isStepInError(): boolean {
        return (
            this.arrivalTimeErrors.length > 0 ||
            this.participantTypeErrors.length > 0 ||
            this.statusError ||
            this.statusWarning
        );
    }

    get statusError(): boolean {
        return this.validateLeadDCOStatusError();
    }

    get statusWarning(): boolean {
        return this.validateLeadDCOStatusWarning();
    }
}
