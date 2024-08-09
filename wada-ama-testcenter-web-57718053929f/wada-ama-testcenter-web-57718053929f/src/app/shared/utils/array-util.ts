export function getNItemsOf<T>(length: number, value: T): Array<T> {
    return Array(...Array(length)).map(() => value);
}

export function isNotEmpty<T>(array: Array<T>): boolean {
    return Array.isArray(array) && array.length > 0;
}

export function isNullOrEmpty<T>(array: Array<T>): boolean {
    return array === null || array.length === 0;
}

export function isEqual(arrLeft: Array<any> | undefined | null, arrRight: Array<any> | undefined | null): boolean {
    if (arrLeft === arrRight) return true;
    if (arrLeft && arrRight) {
        if (arrLeft.length !== arrRight.length) return false;
        const newArrLeft = arrLeft.map((a) => JSON.stringify(a));
        const newArrRight = arrRight.map((a) => JSON.stringify(a));

        let result = true;
        newArrLeft.forEach((elLeft, index) => {
            const elRight = newArrRight[index];
            if (!elLeft.includes(elRight)) {
                result = false;
            }
        });

        return result;
    }
    return false;
}
