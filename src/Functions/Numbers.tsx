export function convertToNumber(x: String, defaultValue: number): number {
    let y = Number(x);
    if (Number.isNaN(y)) {
        return defaultValue;
    }
    return y;
}
