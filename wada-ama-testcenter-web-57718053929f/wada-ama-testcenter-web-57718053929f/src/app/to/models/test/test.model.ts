import { Analysis, GenericStatus, SpecificCode, SportDiscipline } from '@shared/models';

import { getUniqueNumber } from '@shared/utils/unique-number';
import { Moment } from 'moment';
import * as moment from 'moment';
import { Athlete } from '../steps/sections/section-athlete-and-analyses/athlete/athlete.model';
import { Team } from '../team.model';
import { AnalysisResult } from '../steps/sections/section-athlete-and-analyses/analysis/analysis-result.model';
import { UASummary } from '../unsuccessful-attempt/ua-summary';

export class Test {
    id: number | null;

    tempId: string;

    analyses: Array<Analysis>;

    athlete: Athlete | null;

    athleteAccessible: boolean;

    athleteLevel: string;

    dcfCreatable: boolean;

    dcfReadable: boolean;

    dcfId: string;

    modStampLong: number | null;

    placeHolderDescription: string;

    removable: boolean;

    sportDiscipline: SportDiscipline | null;

    status: GenericStatus | null;

    subStatus: GenericStatus | null;

    team: Team | null;

    cancellable: boolean;

    dcfStatus: GenericStatus | null;

    unsuccessfulAttemptSummaries: Array<UASummary>;

    analysisResults: Array<AnalysisResult>;

    unlinkedTest: boolean;

    isPlaceholder: boolean;

    reasonDetail: string;

    gender: string;

    plannedStartDate: Moment | null;

    plannedEndDate: Moment | null;

    constructor(test?: Partial<Test> | null) {
        const {
            unlinkedTest = false,
            isPlaceholder = false,
            id = null,
            tempId = '',
            analyses = [],
            athlete = null,
            athleteAccessible = false,
            athleteLevel = '',
            dcfCreatable = false,
            dcfId = '',
            modStampLong = null,
            placeHolderDescription = '',
            removable = true,
            sportDiscipline = null,
            status = null,
            subStatus = null,
            team = null,
            cancellable = false,
            dcfReadable = false,
            dcfStatus = null,
            unsuccessfulAttemptSummaries = [],
            analysisResults = [],
            reasonDetail = '',
            gender = '',
            plannedStartDate = null,
            plannedEndDate = null,
        } = test || {};

        this.id = id;
        this.tempId = tempId !== '' ? tempId : getUniqueNumber().toString();
        this.analyses = (analyses || []).map((analysis: Analysis) => new Analysis(analysis));
        this.athlete = athlete ? new Athlete(athlete) : null;
        this.athleteAccessible = athleteAccessible;
        this.athleteLevel = athleteLevel;
        this.dcfCreatable = dcfCreatable;
        this.dcfId = dcfId;
        this.modStampLong = modStampLong;
        this.placeHolderDescription = placeHolderDescription;
        this.removable = removable;
        this.sportDiscipline = sportDiscipline ? new SportDiscipline(sportDiscipline) : null;
        this.status = status;
        this.subStatus = subStatus;
        this.team = team ? new Team(team) : null;
        this.cancellable = cancellable;
        this.dcfReadable = dcfReadable;
        this.dcfStatus = dcfStatus ? new GenericStatus(dcfStatus) : null;
        this.unsuccessfulAttemptSummaries = (unsuccessfulAttemptSummaries || []).map(
            (unsuccessfulAttemptSummary) => new UASummary(unsuccessfulAttemptSummary)
        );
        this.analysisResults = (analysisResults || []).map(
            (analysisResult: AnalysisResult) => new AnalysisResult(analysisResult)
        );
        this.unlinkedTest = unlinkedTest;
        this.isPlaceholder = isPlaceholder;
        this.reasonDetail = reasonDetail;
        this.gender = gender;
        this.plannedStartDate = plannedStartDate ? moment.utc(plannedStartDate) : null;
        this.plannedEndDate = plannedEndDate ? moment.utc(plannedEndDate) : null;
    }

    get displayAthleteName(): string {
        const firstName = (this.athlete?.firstName || '').trim();
        const lastName = (this.athlete?.lastName || '').trim();
        return lastName && firstName ? `${lastName}, ${firstName}` : `${lastName}${firstName}`;
    }

    isStatusClosed(): boolean {
        return this.status ? this.status.specificCode === SpecificCode.Closed.toString() : false;
    }

    isStatusCancelled(): boolean {
        return this.status ? this.status.specificCode === SpecificCode.Cancel.toString() : false;
    }
}
