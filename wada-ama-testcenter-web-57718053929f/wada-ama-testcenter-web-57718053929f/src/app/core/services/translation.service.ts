import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TranslationMap {
    [key: string]: string;
}

const GLOBAL_PREFIX = 'global';
const MONTH_PREFIX = 'month';
const SAMPLE_TYPE_PREFIX = 'sampleType';
const SAMPLE_CORRECTOR_PREFIX = 'sampleCorrector';
const TARGET_OBJECT_PREFIX = 'targetObject';
const UNPROCESSABLE_ENTITY_TYPE_PREFIX = 'unprocessableEntityType';
const PARTICIPANT_TYPE_PREFIX = 'participantType';
const ANALYSIS_CATEGORY_PREFIX = 'analysisCategory';
const ANALYSIS_SUBCATEGORY_PREFIX = 'analysisSubCategory';
const EXTENDED_ANALYSIS_CATEGORY_PREFIX = 'extendedAnalysisCategory';
const TDPM_CSV_PREFIX = 'tdpmCsv';
const TDSSA_PREFIX = 'tdssa';
const ATHLETE_LEVEL_PREFIX = 'athleteLevel';
const MAT_MENU_PREFIX = 'tableHeader';
const UNSUCCESSFUL_ATTEMPT_STATUS_PREFIX = 'unsuccessfulAttemptStatus';
const TOASTER_MESSAGE_PREFIX = 'toasterMessage';
const GENDER_PREFIX = 'gender';
const RETIRED_PREFIX = 'retired';
const DCF_STATUS_PREFIX = 'dcf';
const ATHLETE_SELECTED_PREFIX = 'athleteSelected';
const ATHLETE_PREFIX = 'athlete';
const ERROR_MESSAGE_PREFIX = 'errorMessage';
const STATUS_PREFIX = 'status';

@Injectable()
export class TranslationService {
    translations$: Observable<TranslationMap>;

    private translationsSubject$: BehaviorSubject<TranslationMap> = new BehaviorSubject<TranslationMap>({});

    constructor() {
        this.translations$ = this.translationsSubject$.asObservable();
    }

    setMap(translations: TranslationMap): void {
        this.translationsSubject$.next(translations);
    }

    getTranslationKey(key: string): string {
        return key.replace(/\s/g, '_').toLowerCase();
    }

    getGlobalKey(key: string): string {
        return this.getTranslationKey(GLOBAL_PREFIX + key);
    }

    getMonthKey(key: string): string {
        return this.getTranslationKey(MONTH_PREFIX + key);
    }

    getSampleTypeKey(key: string): string {
        return this.getTranslationKey(SAMPLE_TYPE_PREFIX + key);
    }

    getSampleCorrectorKey(key: string): string {
        return this.getTranslationKey(SAMPLE_CORRECTOR_PREFIX + key);
    }

    getTargetObjectKey(key: string): string {
        return this.getTranslationKey(TARGET_OBJECT_PREFIX + key);
    }

    getUnprocessableEntityTypeKey(key: string): string {
        return this.getTranslationKey(UNPROCESSABLE_ENTITY_TYPE_PREFIX + key);
    }

    getParticipantTypeKey(key: string): string {
        return this.getTranslationKey(PARTICIPANT_TYPE_PREFIX + key);
    }

    getAnalysisCategoryKey(key: string): string {
        return this.getTranslationKey(ANALYSIS_CATEGORY_PREFIX + key);
    }

    getAnalysisSubCategoryKey(key: string): string {
        return this.getTranslationKey(ANALYSIS_SUBCATEGORY_PREFIX + key);
    }

    getExtendedAnalysisCategoryKey(key: string): string {
        return this.getTranslationKey(EXTENDED_ANALYSIS_CATEGORY_PREFIX + key);
    }

    getTDPMonitoringCSVKey(key: string): string {
        return this.getTranslationKey(TDPM_CSV_PREFIX + key);
    }

    getDateRangeCalendarButtonKey(key: string): string {
        return this.getTranslationKey(TDSSA_PREFIX + key);
    }

    getAthleteLevelKey(key: string): string {
        return this.getTranslationKey(ATHLETE_LEVEL_PREFIX + key);
    }

    getTableHeaderKey(key: string): string {
        return this.getTranslationKey(MAT_MENU_PREFIX + key);
    }

    getUnsuccessfulAttemptStatusKey(key: string): string {
        return this.getTranslationKey(UNSUCCESSFUL_ATTEMPT_STATUS_PREFIX + key);
    }

    getDCFStatusKey(key: string): string {
        return this.getTranslationKey(DCF_STATUS_PREFIX + key);
    }

    getToasterMessageKey(key: string): string {
        return this.getTranslationKey(TOASTER_MESSAGE_PREFIX + key);
    }

    getGenderKey(key: string): string {
        return this.getTranslationKey(GENDER_PREFIX + key);
    }

    getRetiredKey(key: string): string {
        return this.getTranslationKey(RETIRED_PREFIX + key);
    }

    getAthleteSelectedKey(key: string): string {
        return this.getTranslationKey(ATHLETE_SELECTED_PREFIX + key);
    }

    getAthleteKey(key: string): string {
        return this.getTranslationKey(ATHLETE_PREFIX + key);
    }

    getErrorMessageKey(key: string): string {
        return this.getTranslationKey(ERROR_MESSAGE_PREFIX + key);
    }

    getStatusKey(key: string): string {
        return this.getTranslationKey(STATUS_PREFIX + key);
    }
}
