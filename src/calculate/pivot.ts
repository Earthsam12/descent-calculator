import { Point } from "../lib/Point";
import { Star } from "../lib/Star";
import { Vcalc } from "../vcalc";

/**
 * @param star Star object
 * @param cruise cruise altitude in feet
 * @param finalAlt desired altitude at final waypoint in feet
 * @param DEBUG_MODE whether or not to print debug info
 * @param pivotPoint what waypoint to pivot FPAs off of
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function Pivot(star:Star, cruise: number, finalAlt: number, pivotPoint: Point) {
    const vcalc = new Vcalc();
    var angles: number[] = [];
    var a = 0;
    while (a < 7) {
        a = parseFloat((a + 0.1).toFixed(1));
        angles.push(a);
    }

    // TODO: check geogebra: https://www.geogebra.org/calculator/rcwh9jru
    var des = new Map();
    des.set('RANJR_JARHD', new Map().set('RANJR', 25704).set('LEG FPA', 2.1));
    // TODO: pivot
    // TODO: final alt = vcalc.offsetAltChange with 0 as x
    return des; // TODO: Rememeber to return an empty map if angle(s) didn't work
}
