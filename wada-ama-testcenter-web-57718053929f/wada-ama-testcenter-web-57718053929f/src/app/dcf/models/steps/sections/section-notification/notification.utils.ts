import { NotificationInformation } from './notification-information.model';

export class NotificationUtils {
    static requiredFields = {
        AdvanceNotice: 'advanceNotice',
        AdvanceNoticeReason: 'advanceNoticeReason',
        NotificationDate: 'notificationDate',
        Timezone: 'timezone',
        NotifyingChaperone: 'notifyingChaperone',
    };

    static missingFields(info: NotificationInformation | null = null): Set<string> {
        const missing = new Set<string>(Object.values(this.requiredFields));
        this.removeMissingNotificationTimeFields(info, missing);
        this.removeMissingAdvanceNoticeFields(info, missing);
        this.removeMissingPersonFields(info, missing);
        return missing;
    }

    private static removeMissingNotificationTimeFields(info: NotificationInformation | null, missing: Set<string>) {
        if (info) {
            if (info.notificationDate) {
                missing.delete(this.requiredFields.NotificationDate);
            } else {
                missing.delete(this.requiredFields.Timezone);
            }

            if (info.timezone) {
                missing.delete(this.requiredFields.Timezone);
            }
        }
    }

    private static removeMissingAdvanceNoticeFields(info: NotificationInformation | null, missing: Set<string>) {
        if (info) {
            if (info.advanceNotice !== undefined && info.advanceNotice !== null) {
                missing.delete(this.requiredFields.AdvanceNotice);
                if (!info.advanceNotice) {
                    missing.delete(this.requiredFields.AdvanceNoticeReason);
                }
            }

            if (info.advanceNoticeReason) {
                missing.delete(this.requiredFields.AdvanceNoticeReason);
            }
        }
    }

    private static removeMissingPersonFields(info: NotificationInformation | null, missing: Set<string>) {
        if (info) {
            if (info.notifyingChaperone && info.notifyingChaperone.firstName && info.notifyingChaperone.lastName) {
                missing.delete(this.requiredFields.NotifyingChaperone);
            }
        }
    }
}
