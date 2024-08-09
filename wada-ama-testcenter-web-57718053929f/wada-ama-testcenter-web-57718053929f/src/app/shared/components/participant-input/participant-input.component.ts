import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    Renderer2,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { isNullOrBlank, participantSuggestions } from '@shared/utils';
import { Participant } from '@shared/models';

export const PARTICIPANT_INPUT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ParticipantInputComponent),
    multi: true,
};

@Component({
    selector: 'app-participant-input',
    templateUrl: './participant-input.component.html',
    styleUrls: ['./participant-input.component.scss'],
    providers: [PARTICIPANT_INPUT_VALUE_ACCESSOR],
})
export class ParticipantInputComponent implements AfterViewInit, ControlValueAccessor {
    @ViewChild('firstNameInput', { static: true }) inputRef?: ElementRef;

    @Output() readonly inputChange = new EventEmitter<any>();

    @Input() dataQAFirstName = '';

    @Input() dataQALastName = '';

    @Input() firstNameId = 'firstName';

    @Input() hasAsterisk = false;

    @Input() hasError = false;

    @Input() hasFirstNameError = false;

    @Input() hasLastNameError = false;

    @Input() isDCOParticipant = false;

    @Input() isDisabled = false;

    @Input() isFirstNameTouched = false;

    @Input() isLastNameTouched = false;

    @Input() isReadonly = false;

    @Input() isStartingFocus = false;

    @Input() lastNameId = 'lastName';

    @Input() participants: Array<Participant> = [];

    private _participant: Participant = new Participant({ firstName: '', lastName: '' });

    private firstNameSelected = '';

    private hasChanged = false;

    private lastNameSelected = '';

    private onChange: any;

    private onTouched: any;

    constructor(private root: ElementRef, private _renderer: Renderer2, private _elementRef: ElementRef) {}

    ngAfterViewInit() {
        this._renderer.removeAttribute(this.inputRef?.nativeElement, 'id');
    }

    writeValue(participant: Participant): void {
        this.participant = participant || new Participant();
    }

    registerOnChange(onChange: any): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    notify(): void {
        if (this.onTouched) this.onTouched();
        if (this.hasChanged) {
            if (this.onChange) {
                this.onChange(this.participant);
                if (this.isDCOParticipant) this.inputChange.emit({ participant: this.participant });
            }
        }
        this.hasChanged = false;
    }

    notifyThroughFirstName(): void {
        if (this.isDCOParticipant && isNullOrBlank(this.firstNameSelected)) {
            this.resetParticipant();
        } else if (this.isDCOParticipant) {
            this.firstNameSelected = '';
        }
        this.isFirstNameTouched = true;
        this.notify();
    }

    notifyThroughLastName(): void {
        if (this.isDCOParticipant && isNullOrBlank(this.lastNameSelected)) {
            this.resetParticipant();
        } else if (this.isDCOParticipant) {
            this.lastNameSelected = '';
        }
        this.isLastNameTouched = true;
        this.notify();
    }

    participantSelected(participant: Participant): void {
        const firstName = participant?.firstName || this.participant.firstName;
        this.firstNameSelected = firstName;
        this.lastNameSelected = participant?.lastName || '';
        this.participant = new Participant({ ...participant, firstName });
        this.hasChanged = true;
        this.notify();
    }

    resetParticipant(): void {
        this.isFirstNameTouched = true;
        this.isLastNameTouched = true;
        this.lastNameSelected = '';
        this.firstNameSelected = '';
        this.participant = new Participant({ firstName: '', lastName: '' });
    }

    resetTouched() {
        this.isFirstNameTouched = false;
        this.isLastNameTouched = false;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled && !this.isReadonly) {
            this.participant = new Participant();
        }
    }

    suggestions = (token: string): Observable<Array<Participant>> => {
        return participantSuggestions(token, this.participant, this.participants);
    };

    private namesEqual(p1: Participant, p2: Participant): boolean {
        const f1 = p1.firstName?.trim().toLocaleLowerCase() || '';
        const l1 = p1.lastName?.trim().toLocaleLowerCase() || '';
        const f2 = p2.firstName?.trim().toLocaleLowerCase() || '';
        const l2 = p2.lastName?.trim().toLocaleLowerCase() || '';

        return f1 === f2 && l1 === l2;
    }

    get firstName(): string {
        return this.participant.firstName;
    }

    set firstName(firstName: string) {
        this.participant = new Participant({ ...this.participant, firstName });
    }

    get lastName(): string {
        return this.participant.lastName;
    }

    set lastName(lastName: string) {
        this.participant = new Participant({ ...this.participant, lastName });
    }

    get participant(): Participant {
        return this._participant;
    }

    set participant(value: Participant) {
        const participant = new Participant(value);
        const firstName = participant.firstName?.trim() || '';
        const lastName = participant.lastName?.trim() || '';
        const { activePersonId } = participant;

        if (!this.namesEqual(this.participant, new Participant({ firstName, lastName, activePersonId }))) {
            const existingPerson = this.participants.find((p: Participant) =>
                this.namesEqual(p, new Participant({ firstName, lastName, activePersonId }))
            );
            this._participant = existingPerson || new Participant({ firstName, lastName });
            this.hasChanged = true;
        }
    }
}
