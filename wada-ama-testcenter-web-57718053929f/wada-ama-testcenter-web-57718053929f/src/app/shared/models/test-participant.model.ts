import { getUniqueNumber } from '@shared/utils/unique-number';
import { GenericStatus } from './generic-status.model';
import { ParticipantType } from './participant-type.model';

export class TestParticipant {
    activePersonId: number | null;

    tempId: string;

    arrivalHour: number | null;

    arrivalMinute: number | null;

    comment: string;

    firstName: string;

    lastName: string;

    lastStatusChange: Date | null;

    status: GenericStatus | null;

    type: ParticipantType | null;

    constructor(testParticipant?: Partial<TestParticipant> | null) {
        const {
            activePersonId = null,
            tempId = '',
            arrivalHour = null,
            arrivalMinute = null,
            comment = '',
            firstName = '',
            lastName = '',
            lastStatusChange = null,
            status = null,
            type = null,
        } = testParticipant || {};
        this.activePersonId = activePersonId;
        this.tempId = tempId !== '' ? tempId : getUniqueNumber().toString();
        this.arrivalHour = arrivalHour;
        this.arrivalMinute = arrivalMinute;
        this.comment = comment;
        this.firstName = firstName;
        this.lastName = lastName;
        this.lastStatusChange = lastStatusChange ? new Date(lastStatusChange) : null;
        this.status = status ? new GenericStatus(status) : null;
        this.type = type ? new ParticipantType(type) : null;
    }

    get displayName(): string {
        const firstName = (this.firstName || '').trim();
        const lastName = (this.lastName || '').trim();
        return lastName && firstName ? `${lastName}, ${firstName}` : `${lastName}${firstName}`;
    }

    get arrivalTime(): string {
        const arrivalHourToStr = `0${this.arrivalHour}`.slice(-2);
        const arrivalMinuteToStr = `0${this.arrivalMinute}`.slice(-2);
        return this.arrivalHour !== null && this.arrivalMinute !== null
            ? `${arrivalHourToStr}:${arrivalMinuteToStr}`
            : '';
    }
}
