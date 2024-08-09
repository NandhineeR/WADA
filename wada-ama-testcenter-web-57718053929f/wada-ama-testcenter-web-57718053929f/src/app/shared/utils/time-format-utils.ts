export const timeFormatRegex = /^((2[0-3])|([0-1]?\d)):?([0-5]\d)$/;

export function formatTime(time: string): string {
    let newTime = time;
    const colonMissing: boolean = time.indexOf(':') === -1;

    if (colonMissing && time.length === 3) {
        newTime = `0${time.slice(0, 1)}:${time.slice(1, 3)}`;
    } else if (colonMissing && time.length === 4) {
        newTime = `${time.slice(0, 2)}:${time.slice(2, 4)}`;
    } else if (!colonMissing && time.length === 4) {
        newTime = `0${time}`;
    }

    return newTime;
}
