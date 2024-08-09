export function roundToDecimals(value: number, decimals: number): string {
    return Math.round((value * 10 ** decimals) / 10 ** decimals).toFixed(decimals);
}

export function isValidNumber(value?: number | null): boolean {
    return value !== undefined && value !== null && !Number.isNaN(value);
}
