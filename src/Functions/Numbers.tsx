export function convertToNumber(x: String): number {
    let y = Number(x);
    if (Number.isNaN(y)) {
        return 1;
    }
    return y;
}
