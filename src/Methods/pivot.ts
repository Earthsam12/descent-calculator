import { Point } from "../lib/Point";
import { Star } from "../lib/Star";
import { Vcalc } from "../vcalc";

export function Pivot(star:Star, cruise: number, finalAlt: number, pivotPoint: Point) {
    const vcalc = new Vcalc();
    var angles: number[] = [];
    var a = 0;
    while (a < 7) {
        a = parseFloat((a + 0.1).toFixed(1));
        angles.push(a);
    }

    var des = new Map();
    des.set('RANJR_JARHD', new Map().set('RANJR', 25704).set('LEG FPA', 2.1));
    // TODO: pivot
    return des; // TODO: Rememeber to return an empty map if angle(s) didn't work
}
