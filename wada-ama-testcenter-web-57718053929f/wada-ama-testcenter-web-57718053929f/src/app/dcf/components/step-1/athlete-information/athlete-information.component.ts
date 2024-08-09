import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AthleteInformation, AthleteUtils } from '@dcf/models';
import { DCFActionRight } from '@shared/models';

@Component({
    selector: 'app-athlete-information',
    templateUrl: './athlete-information.component.html',
    styleUrls: ['./athlete-information.component.scss'],
})
export class AthleteInformationComponent implements OnChanges {
    readonly actionRight = DCFActionRight;

    readonly fields = AthleteUtils.requiredFields;

    @Output() readonly showAthleteInformationErrors = new EventEmitter<boolean>(false);

    @Output()
    readonly updateMissingFieldsCount: EventEmitter<number> = new EventEmitter<number>();

    @Input() abpAccess = '';

    @Input() actions: Array<string> = [];

    @Input() arrivalDate?: Date;

    @Input() set athlete(info: AthleteInformation | null) {
        this._athlete = info;
        if (info) this.checkErrors();
    }

    get athlete(): AthleteInformation | null {
        return this._athlete;
    }

    @Input() dcfId = '';

    @Input() isCancelled = false;

    @Input() isUserAnonymous = false;

    @Input() notificationDate?: Date;

    @Input() testGender = null;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    displayAge = false;

    missingFields = new Set<string>();

    private _athlete: AthleteInformation | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        const date = this.arrivalDate || this.notificationDate;
        if ((changes.athlete || changes.arrivalDate) && this.athlete && date) {
            this.displayAge = (this.athlete.dateOfBirth && date >= this.athlete.dateOfBirth) || false;
        }
    }

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingFields = AthleteUtils.missingFields(this.athlete);
        this.updateMissingFieldsCount.emit(this.missingFields.size);
        const hasMissingFields = this.missingFields.size > 0;
        this.showAthleteInformationErrors.emit(hasMissingFields);
    }
}
