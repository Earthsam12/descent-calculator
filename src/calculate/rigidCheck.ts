import { Point } from "../lib/Point";
import { Star } from "../lib/Star";
import { Vcalc } from "../vcalc";

/**
 * @param star Star object
 * @param cruise cruise altitude in feet
 * @param finalAlt desired altitude at final waypoint in feet
 * @param DEBUG_MODE whether or not to print debug info
 * @param point1 first point to clamp to
 * @param point2 second point to clamp to
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function RigidCheck(star:Star, cruise: number, finalAlt: number, point1: Point, point2: Point) {
    const vcalc = new Vcalc();
    var des = new Map();
    des.set('RANJR_JARHD', new Map().set('RANJR', 25704).set('LEG FPA', 2.1));
    // TODO: rigid check
    return des; // TODO: Rememeber to return an empty map if angle(s) didn't work
}
