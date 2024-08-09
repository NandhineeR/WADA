import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { FieldsSecurity, UAActionRight, UAFormControls, UserRolesEnum } from '@shared/models';
import { LocationEnum, UADeletion, UAForm, UAFormUtils } from '@to/models';
import * as fromStore from '@to/store';
import * as fromRootStore from '@core/store';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-ua-view-section',
    templateUrl: './ua-view-section.component.html',
    styleUrls: ['./ua-view-section.component.scss'],
})
export class UaViewSectionComponent {
    readonly actionRight = UAActionRight;

    readonly controls = UAFormControls;

    readonly fields = UAFormUtils.requiredFields;

    readonly locationEnum = LocationEnum;

    @Output()
    readonly showDeleteUAEmitter: EventEmitter<UADeletion> = new EventEmitter<UADeletion>();

    @Input() errors = new Set<string>();

    @Input() locale = '';

    @Input() showErrors = false;

    @Input() status = '';

    @Input() set fieldsSecurity(fieldsSecurity: FieldsSecurity) {
        this.whiteList = fieldsSecurity.fields;
        this.actions = fieldsSecurity.actions;
    }

    @Input() set ua(info: UAForm | null) {
        this._ua = info;
        if (info && info.attemptedContactMethods) {
            this.buildMethods(info.attemptedContactMethods);
        }
    }

    get ua(): UAForm | null {
        return this._ua;
    }

    isUserCorrector$: Observable<boolean> = this.store.select(fromRootStore.getHasRole(UserRolesEnum.CORRECTOR));

    actions: Array<string> = [];

    date = new Date();

    methods = '';

    whiteList = new Map<string, string>();

    private _ua: UAForm | null = null;

    constructor(private store: Store<fromRootStore.IState>) {}

    /**
     * Build a string of the attempted contact methods from a map of the attempted contact methods
     * @param methods: Map<string, boolean>
     * @return string
     */
    buildMethods(methods: Map<string, boolean>): void {
        (methods || []).forEach((value: boolean, key: string) => {
            if (value) this.methods += `${key},\u00A0`;
        });

        // trim last dangling comma and blank space
        this.methods = this.methods.slice(0, this.methods.lastIndexOf(','));
    }

    /**
     * Emit command for ua deletion with the respective data
     */
    showDeleteUA(ua: UAForm): void {
        const uaDeletion = new UADeletion();
        uaDeletion.testId = ua.testId;
        uaDeletion.unsuccessfulAttemptId = ua.id;
        uaDeletion.athleteName = ua.athleteName;
        this.showDeleteUAEmitter.emit(uaDeletion);
    }

    resetUA(): void {
        this.store.dispatch(fromStore.ResetUA());
    }
}
