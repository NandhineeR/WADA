import { Analysis, GenericStatus, SpecificCode, SportDiscipline } from '@shared/models';
import * as moment from 'moment';
import { Team } from '../team.model';
import { AnalysisDisplay } from '../steps/sections/section-athlete-and-analyses/analysis/analysis-display.model';
import { AnalysisResult } from '../steps/sections/section-athlete-and-analyses/analysis/analysis-result.model';
import { UASummary } from '../unsuccessful-attempt/ua-summary';
import { Athlete } from '../steps/sections/section-athlete-and-analyses/athlete/athlete.model';

type Moment = moment.Moment;

export class TestRow {
    id: number | null;

    tempId: string;

    dcfId: string;

    age: string;

    analyses: Array<Analysis>;

    analysisDisplay: Array<AnalysisDisplay>;

    dateOfBirth: Moment | null;

    sportNationality: string;

    sportDiscipline: SportDiscipline | null;

    name: string;

    gender: string;

    laboratories: Set<string>;

    disabilities: Array<string>;

    team: Team | null;

    teams: Array<Team>;

    athleteLevel: string;

    order: number | null;

    status: GenericStatus | null;

    subStatus: GenericStatus | null;

    placeholder: string;

    athleteAccessible: boolean;

    athleteId: string;

    dcfReadable: boolean;

    dcfStatus: GenericStatus | null;

    uas: Array<UASummary>;

    analysisResults: Array<AnalysisResult>;

    canBeSelected: boolean;

    canBeDeleted: boolean;

    canBeCancelled: boolean;

    unlinkedTest: boolean;

    isPlaceholder: boolean;

    dcfCreatable: boolean;

    reasonDetail: string;

    plannedStartDate: Moment | null;

    plannedEndDate: Moment | null;

    athlete: Athlete | null;

    constructor(testRow?: Partial<TestRow> | null) {
        const {
            unlinkedTest = false,
            isPlaceholder = false,
            order = null,
            id = null,
            tempId = '',
            dcfId = '',
            age = '',
            analyses = [],
            dateOfBirth = null,
            sportNationality = '',
            sportDiscipline = null,
            name = '',
            gender = '',
            laboratories = new Set<string>(),
            disabilities = [],
            team = null,
            teams = [],
            athleteLevel = '',
            status = null,
            subStatus = null,
            placeholder = '',
            athleteAccessible = false,
            athleteId = '',
            dcfReadable = false,
            dcfStatus = null,
            uas = [],
            analysisResults = [],
            canBeSelected = true,
            canBeDeleted = true,
            canBeCancelled = true,
            dcfCreatable = false,
            reasonDetail = '',
            plannedStartDate = null,
            plannedEndDate = null,
            athlete = null,
        } = testRow || {};

        this.id = id;
        this.tempId = tempId;
        this.dcfId = dcfId;
        this.age = age;
        this.analyses = (analyses || []).map((analysis) => new Analysis(analysis));
        this.analysisDisplay = [];
        this.dateOfBirth = dateOfBirth ? moment.utc(dateOfBirth) : null;
        this.sportNationality = sportNationality;
        this.team = team ? new Team(team) : null;
        this.name = name;
        this.sportDiscipline = sportDiscipline;
        this.laboratories = laboratories;
        this.gender = gender;
        this.disabilities = disabilities;
        this.athleteLevel = athleteLevel;
        this.teams = (teams || []).map((t) => new Team(t));
        this.order = order;
        this.status = status;
        this.subStatus = subStatus;
        this.placeholder = placeholder;
        this.athleteAccessible = athleteAccessible;
        this.athleteId = athleteId;
        this.dcfReadable = dcfReadable;
        this.dcfStatus = dcfStatus ? new GenericStatus(dcfStatus) : null;
        this.uas = (uas || []).map((ua: UASummary) => new UASummary(ua));
        this.analysisResults = (analysisResults || []).map(
            (analysisResult: AnalysisResult) => new AnalysisResult(analysisResult)
        );
        this.canBeSelected = canBeSelected;
        this.canBeDeleted = canBeDeleted;
        this.canBeCancelled = canBeCancelled;
        this.unlinkedTest = unlinkedTest;
        this.isPlaceholder = isPlaceholder;
        this.dcfCreatable = dcfCreatable;
        this.reasonDetail = reasonDetail;
        this.plannedStartDate = plannedStartDate;
        this.plannedEndDate = plannedEndDate;
        this.athlete = athlete ? new Athlete(athlete) : null;
    }

    getAthleteFirstName(): string {
        return this.name.substring(this.name.indexOf(',') + 2, this.name.length);
    }

    getAthleteLastName(): string {
        return this.name.substring(0, this.name.indexOf(','));
    }

    static setRowOrder(tests: Array<TestRow>): Array<TestRow> {
        tests.forEach((test, index) => {
            test.order = index + 1;
        });
        return tests;
    }

    isCancelled(): boolean {
        return this.status?.specificCode === SpecificCode.Cancel;
    }

    isClosed(): boolean {
        return this.status?.specificCode === SpecificCode.Closed;
    }

    isDCFCreatable(): boolean {
        return !this.isCancelled() && !this.isClosed() && this.dcfId === null && this.dcfCreatable;
    }

    isDCFNotCreatable(): boolean {
        return !this.isCancelled() && !this.isClosed() && this.dcfId === null && !this.dcfCreatable;
    }

    isTestPlaceholder(): boolean {
        return (
            !this.isCancelled() && !this.isClosed() && this.dcfId === null && this.isPlaceholder && this.unlinkedTest
        );
    }

    isDCFReadable(): boolean {
        return (
            (this.dcfStatus?.specificCode === SpecificCode.NotProcessed ||
                this.dcfStatus?.specificCode === SpecificCode.Complete) &&
            this.dcfReadable
        );
    }

    isDCFNotReadable(): boolean {
        return (
            (this.dcfStatus?.specificCode === SpecificCode.NotProcessed ||
                this.dcfStatus?.specificCode === SpecificCode.Complete) &&
            !this.dcfReadable
        );
    }
}
