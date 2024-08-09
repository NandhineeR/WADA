import { AthleteSupportPersonnel } from '@athlete/models';
import { createAction, props } from '@ngrx/store';
import { MajorEvent } from '@shared/models';

export const InitAthleteProfile = createAction(
    '[ATHLETE PROFILE] INIT ATHLETE PROFILE',

    props<{ athleteId: string }>()
);

export const GetAthleteAgents = createAction(
    '[ATHLETE PROFILE] GET ATHLETE AGENTS',

    props<{ athleteId: string }>()
);

export const GetAthleteAgentsSuccess = createAction(
    '[ATHLETE PROFILE] GET ATHLETE AGENTS SUCCESS',

    props<{ athleteAgents: Array<AthleteSupportPersonnel> }>()
);

export const GetAthleteAgentsError = createAction('[ATHLETE PROFILE] GET ATHLETE AGENTS ERROR');

export const GetMajorEvents = createAction(
    '[ATHLETE PROFILE] GET MAJOR EVENTS',

    props<{ athleteId: string }>()
);

export const GetMajorEventsSuccess = createAction(
    '[ATHLETE PROFILE] GET MAJOR EVENTS SUCCESS',

    props<{ majorEvents: Array<MajorEvent> }>()
);

export const GetMajorEventsError = createAction('[ATHLETE PROFILE] GET MAJOR EVENTS ERROR');
