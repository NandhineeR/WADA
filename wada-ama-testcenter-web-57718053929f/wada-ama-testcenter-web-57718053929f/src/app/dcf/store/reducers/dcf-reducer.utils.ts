import {
    AuthorizationInformation,
    BloodPassport,
    DCF,
    NotificationInformation,
    AthleteInformation,
    SampleInformation,
    ProceduralInformation,
    StepsSection,
    StepsSubmitted,
} from '@dcf/models';
import { Attachment, AttachmentType, GenericActivity, ListItem, Test } from '@shared/models';
import {
    sectionAthleteToDCF,
    sectionAuthorizationToDCF,
    sectionNotificationToDCF,
    sectionProceduralToDCF,
    sectionSampleToDCF,
} from '@dcf/mappers';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { NonDCFField } from '../../models/non-dcf-field.model';
import { IDCFState } from '../states/dcf.state';

type SectionFormValues =
    | AuthorizationInformation
    | NotificationInformation
    | AthleteInformation
    | SampleInformation
    | ProceduralInformation;

export function addUrlToAttachment(
    attachments: Array<Attachment>,
    url: string,
    type: AttachmentType
): Array<Attachment> {
    const attachmentsCopy = JSON.parse(JSON.stringify(attachments));
    attachmentsCopy.map((attachment: Attachment) => {
        if (attachment.attachmentType === type) attachment.url = url;
        return attachment;
    });
    return attachmentsCopy;
}

export function initializeNonDCFFieldFromDCF(
    dcf: DCF,
    test: Test,
    athlete?: AthleteInformation,
    genericActivities?: Array<GenericActivity>
): NonDCFField {
    const nonDCF = new NonDCFField();
    nonDCF.test = test;
    if (genericActivities) {
        nonDCF.genericActivities = genericActivities;
    }
    if (athlete) {
        nonDCF.athlete = new AthleteInformation(athlete);
    }
    if (dcf.sampleInformation && dcf.sampleInformation.samples) {
        const bloodPassport: BloodPassport | undefined =
            (dcf.sampleInformation.samples?.find((sample) => SampleFactory.isBloodPassport(sample)) as BloodPassport) ||
            undefined;
        nonDCF.tempLoggerStatus = bloodPassport?.tempLoggerStatus || undefined;
    }

    return nonDCF;
}

export function setAuthorizationDefaultValues(
    authorization: AuthorizationInformation | null,
    ados: Array<ListItem>,
    concatOrganizations: Array<ListItem>,
    orgId: number
): AuthorizationInformation | null {
    if (ados.length === 0 || concatOrganizations.length <= ados.length || authorization) {
        return authorization;
    }

    const newAuthorization = new AuthorizationInformation();
    newAuthorization.testingAuthority = ados
        ? new ListItem(ados.find((org) => org.id === orgId))
        : newAuthorization.testingAuthority;

    newAuthorization.sampleCollectionAuthority = concatOrganizations
        ? new ListItem(concatOrganizations.find((org) => org.id === orgId))
        : newAuthorization.sampleCollectionAuthority;

    newAuthorization.resultManagementAuthority = ados
        ? new ListItem(ados.find((org) => org.id === orgId))
        : newAuthorization.resultManagementAuthority;

    return newAuthorization;
}

export function sectionToDCF(form: SectionFormValues, state: IDCFState, section: StepsSection): IDCFState {
    switch (section) {
        case StepsSection.AthleteSection:
            return sectionAthleteToDCF(state, form as AthleteInformation);
        case StepsSection.AuthorizationSection:
            return sectionAuthorizationToDCF(state, form as AuthorizationInformation);
        case StepsSection.NotificationSection:
            return sectionNotificationToDCF(state, form as NotificationInformation);
        case StepsSection.ProceduralSection:
            return sectionProceduralToDCF(state, form as ProceduralInformation);
        case StepsSection.SampleSection:
            return sectionSampleToDCF(state, form as SampleInformation);
        default:
            return state;
    }
}

export function submitForm(action: any, state: IDCFState, section: StepsSection): IDCFState {
    const updatedState: IDCFState = sectionToDCF(action.values, state, section);
    const hasBeenSubmitted = new StepsSubmitted(state.hasBeenSubmitted);
    switch (section) {
        case StepsSection.AthleteSection:
            hasBeenSubmitted.athleteSectionSubmitted = true;
            break;
        case StepsSection.AuthorizationSection:
            hasBeenSubmitted.authorizationSectionSubmitted = true;
            break;
        case StepsSection.NotificationSection:
            hasBeenSubmitted.notificationSectionSubmitted = true;
            break;
        case StepsSection.ProceduralSection:
            hasBeenSubmitted.proceduralSectionSubmitted = true;
            break;
        case StepsSection.SampleSection:
            hasBeenSubmitted.sampleSectionSubmitted = true;
            break;
        default:
            break;
    }
    return { ...updatedState, hasBeenSubmitted };
}

export function updateAuthority(actionAuthority: any, stateAuthority: any): ListItem {
    let newAuthority = null;
    if (actionAuthority?.id) {
        newAuthority = new ListItem(actionAuthority);
        const [, description] = newAuthority.description.split(/\s*-\s*/);
        newAuthority.description = description;
    } else {
        newAuthority = new ListItem(stateAuthority);
    }
    return newAuthority;
}

export function updateTimezoneFieldsFromRootSource(currentDCF: DCF, action: any): DCF {
    const notification: NotificationInformation = currentDCF.notification
        ? new NotificationInformation(currentDCF.notification)
        : new NotificationInformation();

    const proceduralInformation: ProceduralInformation = currentDCF.proceduralInformation
        ? new ProceduralInformation(currentDCF.proceduralInformation)
        : new ProceduralInformation();

    const sampleInformation: SampleInformation = currentDCF.sampleInformation
        ? new SampleInformation(currentDCF.sampleInformation)
        : new SampleInformation();

    notification.timezone = action.timezoneDefault;
    sampleInformation.timezone = action.timezoneDefault;
    proceduralInformation.timezone = action.timezoneDefault;

    if (sampleInformation.samples) {
        sampleInformation.samples.forEach((sample) => {
            sample.timezone = action.timezoneDefault;
        });
    }
    return {
        ...currentDCF,
        notification,
        sampleInformation,
        proceduralInformation,
    };
}
