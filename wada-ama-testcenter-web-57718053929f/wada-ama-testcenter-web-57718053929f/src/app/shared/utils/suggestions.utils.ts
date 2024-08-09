import { isObservable, Observable, of } from 'rxjs';
import { Participant, SportDiscipline } from '@shared/models';
import { map } from 'rxjs/operators';
import { latinize } from './string-utils';

/**
 * Returns a list of participants filtered by name for a given token
 * @param token The Token
 * @param currentParticipant The current participant
 * @param participants the array of participants that needs to be filtered
 * @param userAccount boolean that states whether the participant has an user account
 */
export function participantSuggestions(
    token: string,
    currentParticipant: Participant,
    participants: Array<Participant>,
    userAccount?: boolean
): Observable<Array<Participant>> {
    const latinizedToken = latinize(token.toLocaleLowerCase());
    return of(
        participants.filter((participant: Participant) => {
            const name = `${participant.lastName} ${participant.firstName}`;
            // Filters out participants with no user account + unmatched users based on the given token
            if (userAccount !== undefined) {
                return (
                    participant.userAccount === userAccount &&
                    latinize(name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0 &&
                    !(participant.firstName === currentParticipant.firstName && participant.lastName === token)
                );
            }

            // filters out only unmatched users based on the given token regardless of the user account
            return (
                latinize(name.toLocaleLowerCase()).indexOf(latinizedToken) >= 0 &&
                !(participant.firstName === currentParticipant.firstName && participant.lastName === token)
            );
        })
    );
}

export function getSportDisciplineSuggestions(
    token: string,
    sportDisciplines: Array<SportDiscipline> | Observable<Array<SportDiscipline>>
): Observable<Array<SportDiscipline>> {
    const sportDisciplines$ = isObservable(sportDisciplines) ? sportDisciplines : of(sportDisciplines);
    const latinizedToken = latinize(token.toLocaleLowerCase());
    return sportDisciplines$.pipe(
        map((suggestions: Array<SportDiscipline>) =>
            suggestions.filter(
                (sport: SportDiscipline): boolean =>
                    latinize(sport.displayDescriptionName.toLocaleLowerCase()).indexOf(latinizedToken) >= 0
            )
        )
    );
}
