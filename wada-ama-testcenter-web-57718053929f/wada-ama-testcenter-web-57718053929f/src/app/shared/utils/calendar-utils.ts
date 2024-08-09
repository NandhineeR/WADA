/**
 * Class created to give additional support to calendar in components
 */
export class CalendarUtils {
    showCalendar = false;

    /**
     * Detects when calendar is open
     */
    isCalendarDisplayed(showCalendar: boolean): void {
        this.showCalendar = showCalendar;
    }
}
