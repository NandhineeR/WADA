/* eslint-disable prettier/prettier */
import { Component, Input } from '@angular/core';
import { ConflictException } from '@core/models';
import * as fromStore from '@dcf/store';
import { Store } from '@ngrx/store';
import * as fromRootStore from '@core/store';
import {
    OPTIMISTIC_LOCK_EXCEPTION,
    SAMPLE_CODE_VALIDATION_ERROR,
    SAMPLE_CODE_VALIDATION_WARNING,
} from '@shared/utils/exception-code';

type NotificationType = 'error' | 'warning' | 'informative' | 'success';

@Component({
    selector: 'app-dcf-notifications',
    template: `
        <app-notification type="{{ type }}" class="wrapper">
            <div *ngIf="conflictException && conflictException.conflict?.code === OPTIMISTIC_LOCK_EXCEPTION">
                <span i18n="@@changesNotSavedConflictErrorsDetected">Your changes have not been saved since {{ username }} has modified this Doping Control Form while you were editing it.</span>
                <ul links class="error-link-list">
                    <li>
                        <span class="dcf-view" i18n="@@viewNewlyModifiedDopingControlForm">View the newly modified Doping Control Form.</span>
                        <a class="dcf-view-link" i18n="@@viewDcfIdX" (click)="backToViewDCF()">View DCF - {{ dcfId }}</a>
                    </li>
                </ul>
            </div>
            <div *ngIf="conflictException && conflictException.conflict?.code === SAMPLE_CODE_VALIDATION_ERROR && type !== WARNING_ONLY">
                <span i18n="@@sampleTypeXsampleCodeXSentToLabXWarningNotification" class="sampleCodeError">{{ sampleType | titlecase }} sample {{ sampleCode }} sent to {{ lab }} already exists in ADAMS. Make sure the testing authority, sport / discipline, sample code, sample type, manufacturer and laboratory fields are correct.</span>
            </div>
            <div *ngIf="!conflictException && saveError">
                <span i18n="@@changesNotSavedADAMSUnavailable">Your changes have not been saved because ADAMS is currently unavailable, try again.</span>
            </div>
            <ng-content></ng-content>
        </app-notification>
    `,
    styleUrls: ['./dcf-notifications.component.scss'],
})
export class DCFNotificationsComponent {
    readonly OPTIMISTIC_LOCK_EXCEPTION = OPTIMISTIC_LOCK_EXCEPTION;

    readonly SAMPLE_CODE_VALIDATION_ERROR = SAMPLE_CODE_VALIDATION_ERROR;

    readonly SAMPLE_CODE_VALIDATION_WARNING = SAMPLE_CODE_VALIDATION_WARNING;

    readonly WARNING_ONLY = 'warning';

    @Input() conflictException: ConflictException | null = null;

    @Input() dcfId = '';

    @Input() saveError?: boolean;

    @Input() type?: NotificationType;

    constructor(private store: Store<fromRootStore.IState>) {}

    backToViewDCF(): void {
        this.store.dispatch(fromStore.BackToViewDCF());
    }

    get lab(): string {
        return (
            (this.conflictException &&
                this.conflictException.conflict &&
                this.conflictException.conflict.conflictParameters &&
                this.conflictException.conflict.conflictParameters.get('laboratory')) ||
            ''
        );
    }

    get sampleCode(): string {
        return (
            (this.conflictException &&
                this.conflictException.conflict &&
                this.conflictException.conflict.conflictParameters &&
                this.conflictException.conflict.conflictParameters.get('sampleCode')) ||
            ''
        );
    }

    get sampleType(): string {
        return this.conflictException?.conflict?.conflictParameters?.get('sampleType')?.split('_').join(' ') || '';
    }

    get username(): string {
        return this.conflictException?.conflict?.conflictParameters?.get('lastUpdatedCompleteName') || '';
    }
}