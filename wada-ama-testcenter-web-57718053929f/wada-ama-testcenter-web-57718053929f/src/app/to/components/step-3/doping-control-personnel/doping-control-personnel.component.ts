import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpecificCode, TOFormControls } from '@shared/models';
import { AuthorizationUtils, DopingControlPersonnelInformation, DopingControlPersonnelUtils } from '@to/models';

@Component({
    selector: 'app-doping-control-personnel',
    templateUrl: './doping-control-personnel.component.html',
})
export class DopingControlPersonnelComponent {
    readonly controls = TOFormControls;

    readonly fields = AuthorizationUtils.requiredFields;

    @Output() readonly errors = new EventEmitter<boolean>();

    @Input() canWrite = false;

    @Input() set dopingControlPersonnel(info: DopingControlPersonnelInformation | null) {
        this._dopingControlPersonnel = info;
        if (info) this.checkErrors();
    }

    get dopingControlPersonnel(): DopingControlPersonnelInformation | null {
        return this._dopingControlPersonnel;
    }

    @Input() status = '';

    @Input() testingOrderId = null;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    missingFields = new Set<string>();

    private _dopingControlPersonnel: DopingControlPersonnelInformation | null = null;

    private checkErrors(): void {
        this.missingFields.clear();

        this.missingFields = DopingControlPersonnelUtils.missingFields();

        const hasMissingFields = this.missingFieldsCount > 0;

        setTimeout(() => this.errors.emit(hasMissingFields));
    }

    get missingFieldsCount(): number {
        return this.status === SpecificCode.Cancel ? 0 : this.missingFields.size;
    }
}
