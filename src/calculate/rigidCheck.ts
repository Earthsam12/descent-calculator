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
        if (leg.endPoint === revLegs[0].endPoint && leg.endpoint === point1) {
            break;
        }
        point1DistFromEnd += leg.length;
        if (leg.startPoint === point1) {
            break;
        }
    }

    var point2DistFromEnd = 0;
    for (const leg of revLegs) {
        if (leg.endPoint === revLegs[0].endPoint && leg.endpoint === point2) { // Theoretically not possible but just to be safe
            break;
        }
        point1DistFromEnd += leg.length;
        if (leg.startPoint === point2) {
            break;
        }
    }

    var calcAlt: number;
    var wptDistFromEnd = 0
    var finalPointCalcAlt: number;

    if (DEBUG_MODE) {console.log(`testing required angle (${requiredAngle})`)}
    for (const index = 0; index < revLegs.length; index++) {
        leg = revLegs[index];
        const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];
        if (index === 0) {
            calcAlt = vcalc.pointSlopeAlt(0, requiredAngle, pivotPointDistFromEnd, pivotPoint.tops);
            if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.endPoint.name}`)};
            if (!(calcAlt >= leg.endPoint.bottoms && calcAlt <= leg.endPoint.tops)) {
                return undefined;
            }
            finalPointCalcAlt = calcAlt;
        }
        calcAlt = vcalc.pointSlopeAlt(wptDistFromEnd, requiredAngle, pivotPointDistFromEnd, pivotPoint.tops);
        if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.startPoint.name}`)};
        if (!(calcAlt >= constraints[0] && calcAlt <= constraints[1])) {
            return undefined;
        }
        des.set(leg.name, new Map().set(leg.startPoint.name, calcAlt).set('LEG FPA', requiredAngle))
    }
    var des = new Map(Array.from(des).reverse());
    des.set(revLegs[0].endpoint, finalPointCalcAlt);
    des.set('TOD', [parseFloat((vcalc.desDistance(cruise - des.get(star.legs[0].name).get(star.points[0].name), requiredAngle).toFixed(1))), requriedAngle]);
    return des;
}
