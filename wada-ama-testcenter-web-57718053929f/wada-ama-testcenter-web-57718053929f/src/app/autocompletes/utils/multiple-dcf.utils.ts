import { Participant } from '@shared/models';

export function buildParticipantMap(sourceMap: any): Map<string, Array<Participant>> {
    const map = new Map<string, Array<Participant>>();
    Object.keys(sourceMap).forEach((key: string) =>
        map.set(
            key,
            (sourceMap[key] || []).map((value: any) => new Participant(value))
        )
    );
    return map;
}
