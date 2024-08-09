export function getUniqueNumber(): number {
    return Math.floor(new Date().valueOf() * Math.random()); // NOSONAR
}
