import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem, SpecificCode, TOFormControls } from '@shared/models';
import { AuthorizationInformation, AuthorizationUtils, TestTimingEnum } from '@to/models';

@Component({
    selector: 'app-to-authorization',
    templateUrl: './authorization.component.html',
})
export class AuthorizationComponent {
    readonly controls = TOFormControls;

    readonly fields = AuthorizationUtils.requiredFields;

    readonly testTimingEnum = TestTimingEnum;

    @Output() readonly errors = new EventEmitter<boolean>();

    @Input() set authorization(info: AuthorizationInformation | null) {
        this._authorization = info;
        if (info) this.checkErrors();
    }

    get authorization(): AuthorizationInformation | null {
        return this._authorization;
    }

    @Input() behalfOfSCA: ListItem | null = null;

    @Input() canWrite = false;

    @Input() status = '';

    @Input() testingOrderId = null;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    missingFields = new Set<string>();

    private _authorization: AuthorizationInformation | null = null;

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingFields = AuthorizationUtils.missingFields(this.authorization);
        const hasMissingFields = this.missingFieldsCount > 0;
        setTimeout(() => this.errors.emit(hasMissingFields));
    }

    get missingFieldsCount(): number {
        return this.status === SpecificCode.Cancel ? 0 : this.missingFields.size;
    }
}
