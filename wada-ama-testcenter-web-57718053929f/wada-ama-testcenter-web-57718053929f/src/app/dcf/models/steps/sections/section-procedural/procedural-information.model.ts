import { Participant } from '@shared/models';
import * as moment from 'moment';
import { Moment } from 'moment';
import { propsUndefinedOrEmpty } from '@shared/utils/object-util';
import { NonConformity } from './non-conformity.model';
import { Timezone } from '../../../dcf/timezone.model';

export class ProceduralInformation {
    athleteComment: string | null;

    athleteRepresentative: Participant | null;

    consentForResearch: boolean | undefined;

    dco: Participant | null;

    dcoComment: string | null;

    declarationOfTransfusion: string | null;

    declarationOfSupplements: string | null;

    endOfProcedureDate: Moment | null;

    irregularities: string | null;

    nonConformities: Array<NonConformity>;

    proceduralIrregularities: string | null;

    timezone: Timezone | null;

    constructor(proceduralInformation?: Partial<ProceduralInformation> | null) {
        const {
            athleteComment = '',
            athleteRepresentative = null,
            consentForResearch = false,
            dco = null,
            dcoComment = null,
            declarationOfTransfusion = null,
            declarationOfSupplements = null,
            endOfProcedureDate = null,
            irregularities = null,
            nonConformities = [],
            proceduralIrregularities = null,
            timezone = null,
        } = proceduralInformation || {};

        this.athleteComment = athleteComment;
        this.athleteRepresentative = athleteRepresentative ? new Participant(athleteRepresentative) : null;
        this.consentForResearch = consentForResearch;
        this.dco = dco ? new Participant(dco) : null;
        this.dcoComment = dcoComment;
        this.declarationOfTransfusion = declarationOfTransfusion;
        this.declarationOfSupplements = declarationOfSupplements;
        this.endOfProcedureDate = endOfProcedureDate ? moment(endOfProcedureDate) : null;
        this.irregularities = irregularities;
        this.nonConformities = nonConformities?.map((nonConformity) => new NonConformity(nonConformity)) || [];
        this.proceduralIrregularities = proceduralIrregularities;
        this.timezone = timezone && !propsUndefinedOrEmpty(timezone) ? new Timezone(timezone) : null;
    }
}
