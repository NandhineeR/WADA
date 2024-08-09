import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DCFActionRight, ListItem, TOItem } from '@shared/models';
import { AuthorizationInformation, AuthorizationUtils, DcfBinding } from '@dcf/models';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-dcf-authorization',
    templateUrl: './authorization.component.html',
    styleUrls: ['./authorization.component.scss'],
})
export class AuthorizationComponent {
    readonly actionRight = DCFActionRight;

    readonly fields = AuthorizationUtils.requiredFields;

    @Output()
    readonly changeTestingOrderEmitter: EventEmitter<DcfBinding> = new EventEmitter<DcfBinding>();

    @Output()
    readonly updateMissingFieldsCount: EventEmitter<number> = new EventEmitter<number>();

    @Input() testingOrders$: Observable<Array<TOItem>> = of([]);

    @Input() actions: Array<string> = [];

    @Input() set authorization(info: AuthorizationInformation | null) {
        this._authorization = info;
        this.checkErrors();
    }

    get authorization(): AuthorizationInformation | null {
        return this._authorization;
    }

    @Input() dcfId = '';

    @Input() isCancelled = false;

    @Input() isUserCorrector = false;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    missingFields = new Set<string>();

    private _authorization: AuthorizationInformation | null = null;

    /**
     * Emits a Bind Dcf To Testing Order model in order to pass this information to the parent
     * given a reason for this operation
     */
    bindDCFToTestingOrder(bindDcfToTO: DcfBinding): void {
        this.changeTestingOrderEmitter.emit(bindDcfToTO);
    }

    getName(item: ListItem | null): string {
        return item?.name || '';
    }

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingFields = AuthorizationUtils.missingFields(this.authorization);
        this.updateMissingFieldsCount.emit(this.missingFields.size);
    }
}
