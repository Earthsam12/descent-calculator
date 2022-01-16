import { Point } from "../Classes/Point";
import { Star } from "../Classes/Star";
import { Vcalc } from "../vcalc";

export function RigidCheck(star:Star, cruise: number, finalAlt: number, point1: Point, point2: Point) {
    const vcalc = new Vcalc();
    var des = new Map();
    des.set('RANJR_JARHD', new Map().set('RANJR', 25704).set('LEG FPA', 2.1));
    return des; // TODO: Rememeber to return an empty map if angle(s) didn't work
}
