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
 * @param DEBUG_MODE whether or not to print debug info (false by default)
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function RigidCheck(star:Star, cruise: number, finalAlt: number, point1: Point, point2: Point, DEBUG_MODE = false) {
    const vcalc = new Vcalc();
    var des = new Map();
    const revLegs = star.legs.slice().reverse();

    var firstTargetAltitude: number;
    if (star.legs[0].startPoint.tops === 100000) {
        firstTargetAltitude = star.legs[0].startPoint.bottoms + 1000;
    } else if (star.legs[0].startPoint.bottoms === 0) {
        firstTargetAltitude = star.legs[0].startPoint.tops - 1000;
    } else if (star.legs[0].startPoint.tops == 100000 && star.legs[0].startPoint.bottoms == 0) {
        firstTargetAltitude = cruise;  // Hopefully this will never be the case...
    } else {
        firstTargetAltitude = (star.legs[0].startPoint.tops + star.legs[0].startPoint.bottoms) / 2;
    }

    const idealAngle = parseFloat(vcalc.desAngle(star.length, firstTargetAltitude - finalAlt).toFixed(1));

    var point1DistFromEnd = 0;
    for (const leg of revLegs) {
        if (leg.endPoint === revLegs[0].endPoint && leg.endPoint === point1) {
            break;
        }
        point1DistFromEnd += leg.length;
        if (leg.startPoint === point1) {
            break;
        }
    }

    var point2DistFromEnd = 0;
    for (const leg of revLegs) {
        if (leg.endPoint === revLegs[0].endPoint && leg.endPoint === point2) { // Theoretically not possible but just to be safe
            break;
        }
        point2DistFromEnd += leg.length;
        if (leg.startPoint === point2) {
            break;
        }
    }

    const requiredAngle = vcalc.desAngle(Math.abs(point2DistFromEnd - point1DistFromEnd), Math.abs(point2.tops - point1.tops));

    var calcAlt: number;
    var wptDistFromEnd = 0
    var finalPointCalcAlt: number;

    if (DEBUG_MODE) {console.log(`testing required angle (${requiredAngle})`)}
    for (let index = 0; index < revLegs.length; index++) {
        const leg = revLegs[index];
        const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];
        if (index === 0) {
            calcAlt = vcalc.pointSlopeAlt(0, requiredAngle, point1DistFromEnd, point1.tops);
            if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.endPoint.name}`)};
            if (!(calcAlt >= leg.endPoint.bottoms && calcAlt <= leg.endPoint.tops)) {
                return undefined;
            }
            finalPointCalcAlt = calcAlt;
        }
        wptDistFromEnd += leg.length;
        calcAlt = vcalc.pointSlopeAlt(wptDistFromEnd, requiredAngle, point1DistFromEnd, point1.tops);
        if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.startPoint.name}`)};
        if (!(Math.round(calcAlt) >= constraints[0] && Math.round(calcAlt) <= constraints[1])) { // * sorta sus rounding since i dont want to ignore rigid points
            return undefined;
        }
        des.set(leg.name, new Map().set(leg.startPoint.name, Math.round(calcAlt)).set('LEG FPA', parseFloat(requiredAngle.toFixed(3))));
    }
    var des = new Map(Array.from(des).reverse());
    des.set(revLegs[0].endPoint.name, finalPointCalcAlt);
    des.set('TOD', [parseFloat((vcalc.desDistance(cruise - des.get(star.legs[0].name).get(star.points[0].name), requiredAngle).toFixed(1))), requiredAngle]);
    return des;
}
