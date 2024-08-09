import { GenericActivity, Test } from '@shared/models';
import { AthleteInformation, MatchingStatus } from './steps/sections';

export class NonDCFField {
    test: Test = new Test();

    athlete = new AthleteInformation();

    athleteHasEmail = false;

    emailNotProvided = false;

    coachNotApplicable = false;

    doctorNotApplicable = false;

    tempLoggerStatus: MatchingStatus | undefined = undefined;

    genericActivities: Array<GenericActivity> = [];
}
