import { Address, FieldsSecurity, Participant, SportDiscipline } from '@shared/models';
import { Moment } from 'moment';
import { propsUndefinedOrEmpty } from '@shared/utils/object-util';
import { SampleFactory } from '@dcf/utils/base-sample/sample.factory';
import { Sample } from '../steps';
import { Timezone } from './timezone.model';

export class DCFForm {
    id: number | null;

    address: Address | null;

    athleteLevel: string;

    email: string;

    emailNotProvided: boolean | null;

    testId: string;

    athleteId: string;

    name: string;

    sportDiscipline: SportDiscipline | null;

    notificationDate: Moment | null;

    notificationTimezone: Timezone | null;

    advanceNotice: boolean | null;

    notifyingChaperone: Participant | null;

    coach: Participant | null;

    doctor: Participant | null;

    coachNotApplicable: boolean | null;

    doctorNotApplicable: boolean | null;

    arrivalDate: Moment | null;

    arrivalTimezone: Timezone | null;

    feeForService: boolean;

    samples: Array<Sample>;

    status: string;

    dco: Participant | null;

    consentForResearch: boolean | undefined;

    endOfProcedureDate: Moment | null;

    endOfProcedureTimezone: Timezone | null;

    declarationOfSupplements: string | null;

    fieldsSecurity: FieldsSecurity;

    constructor(dcfForm?: Partial<DCFForm> | null) {
        const {
            id = null,
            address = null,
            athleteLevel = '',
            email = '',
            emailNotProvided = null,
            testId = '',
            athleteId = '',
            name = '',
            sportDiscipline = null,
            notificationDate = null,
            notificationTimezone = null,
            advanceNotice = false,
            feeForService = false,
            notifyingChaperone = null,
            coach = null,
            doctor = null,
            arrivalDate = null,
            arrivalTimezone = null,
            status = '',
            samples = [],
            coachNotApplicable = false,
            doctorNotApplicable = false,
            dco = null,
            consentForResearch = false,
            endOfProcedureDate = null,
            endOfProcedureTimezone = null,
            declarationOfSupplements = null,
            fieldsSecurity = new FieldsSecurity(),
        } = dcfForm || {};

        this.id = id;
        this.address = address;
        this.athleteLevel = athleteLevel;
        this.email = email;
        this.emailNotProvided = emailNotProvided;
        this.testId = testId;
        this.athleteId = athleteId;
        this.name = name;
        this.sportDiscipline = sportDiscipline;
        this.notificationDate = notificationDate;
        this.notificationTimezone =
            notificationTimezone && !propsUndefinedOrEmpty(notificationTimezone)
                ? new Timezone(notificationTimezone)
                : null;
        this.advanceNotice = advanceNotice;
        this.notifyingChaperone = notifyingChaperone;
        this.coach = coach;
        this.coachNotApplicable = coachNotApplicable;
        this.doctor = doctor;
        this.doctorNotApplicable = doctorNotApplicable;
        this.arrivalDate = arrivalDate || null;
        this.arrivalTimezone =
            arrivalTimezone && !propsUndefinedOrEmpty(arrivalTimezone) ? new Timezone(arrivalTimezone) : null;
        this.feeForService = feeForService;
        this.samples = samples.filter((sample) => sample !== null).map((sample) => SampleFactory.createSample(sample));
        this.status = status;
        this.address = address ? new Address(address) : null;
        this.fieldsSecurity = fieldsSecurity;
        this.dco = dco ? new Participant(dco) : null;
        this.consentForResearch = consentForResearch;
        this.declarationOfSupplements = declarationOfSupplements;
        this.endOfProcedureDate = endOfProcedureDate || null;
        this.endOfProcedureTimezone =
            endOfProcedureTimezone && !propsUndefinedOrEmpty(endOfProcedureTimezone)
                ? new Timezone(endOfProcedureTimezone)
                : null;
    }
}
