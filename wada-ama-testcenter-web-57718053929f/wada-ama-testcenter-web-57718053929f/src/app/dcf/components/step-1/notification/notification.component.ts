import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationInformation, NotificationUtils } from '@dcf/models';
import { DCFActionRight } from '@shared/models';
import { isNullOrBlank } from '@shared/utils';

@Component({
    selector: 'app-dcf-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
    readonly actionRight = DCFActionRight;

    readonly fields = NotificationUtils.requiredFields;

    @Output() readonly showNotificationErrors = new EventEmitter<boolean>(false);

    @Output()
    readonly updateMissingFieldsCount: EventEmitter<number> = new EventEmitter<number>();

    @Input() actions: Array<string> = [];

    @Input() dcfId = '';

    @Input() isCancelled = false;

    @Input() set notification(info: NotificationInformation | null) {
        this._notification = info;
        if (info) this.checkErrors();
    }

    get notification(): NotificationInformation | null {
        return this._notification;
    }

    @Input() timeSlot = false;

    @Input() whiteList: Map<string, string> = new Map<string, string>();

    missingFields = new Set<string>();

    private _notification: NotificationInformation | null = null;

    displayTimeSlotLabel(): boolean {
        return !isNullOrBlank(this._notification?.notificationDate?.toString());
    }

    private checkErrors(): void {
        this.missingFields.clear();
        this.missingFields = NotificationUtils.missingFields(this.notification);
        this.updateMissingFieldsCount.emit(this.missingFields.size);
        const hasMissingFields = this.missingFields.size > 0;
        this.showNotificationErrors.emit(hasMissingFields);
    }
}
