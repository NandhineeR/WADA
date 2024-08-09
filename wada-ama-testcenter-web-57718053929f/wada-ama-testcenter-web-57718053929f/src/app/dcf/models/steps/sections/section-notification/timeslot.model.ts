export class TimeSlot {
    startHour: number;

    startMinute: number;

    constructor(data?: TimeSlot) {
        this.startHour = data?.startHour || 0;
        this.startMinute = data?.startMinute || 0;
    }
}
