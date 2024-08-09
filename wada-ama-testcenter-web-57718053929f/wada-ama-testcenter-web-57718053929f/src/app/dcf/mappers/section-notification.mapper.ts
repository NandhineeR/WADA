import { adjustTimezoneToLocal, propsUndefined, propsUndefinedOrEmpty } from '@shared/utils';
import { Country, Participant, Region } from '@shared/models';
import { IDCFState } from '@dcf/store/states/dcf.state';
import { DCF, NotificationInformation, Timezone } from '@dcf/models';

export function dcfToSectionNotification(dcf: DCF): NotificationInformation | undefined {
    if (!dcf || !dcf.notification) {
        return undefined;
    }
    const { notification } = dcf;

    return new NotificationInformation({
        advanceNotice: notification.advanceNotice,
        advanceNoticeReason: notification.advanceNoticeReason,
        notificationDate: adjustTimezoneToLocal(notification.notificationDate),
        timezone: new Timezone(notification.timezone),
        country: new Country(notification.country),
        region: new Region(notification.region),
        city: notification.city,
        identificationDocument: notification.identificationDocument,
        identificationDocumentType: notification.identificationDocumentType,
        selectionCriteria: notification.selectionCriteria,
        notifyingChaperone: notification.notifyingChaperone ? new Participant(notification.notifyingChaperone) : null,
    });
}

export function sectionNotificationToDCF(state: IDCFState, form: NotificationInformation): IDCFState {
    const advanceNoticeReason = (form.advanceNoticeReason || '').trim();
    const city = (form.city || '').trim();

    const notif = new NotificationInformation({
        advanceNotice: form.advanceNotice,
        advanceNoticeReason: form.advanceNotice && advanceNoticeReason ? advanceNoticeReason : null,
        notificationDate: adjustTimezoneToLocal(form.notificationDate),
        timezone: form.timezone,
        country: propsUndefinedOrEmpty(form.country) ? null : form.country,
        region: propsUndefinedOrEmpty(form.region) ? null : form.region,
        city: city || null,
        identificationDocument: form.identificationDocument,
        identificationDocumentType: form.identificationDocumentType,
        selectionCriteria: form.selectionCriteria,
        notifyingChaperone: propsUndefined(form.notifyingChaperone) ? null : form.notifyingChaperone,
    });

    const updatedDCF = {
        ...state.currentDcf,
        notification: propsUndefined(notif) ? null : notif,
    };

    return { ...state, currentDcf: updatedDCF };
}
