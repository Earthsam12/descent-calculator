import { Point } from "../lib/Point";
import { Star } from "../lib/Star";
import { Vcalc } from "../vcalc";

/**
 * @param star Star object
 * @param cruise cruise altitude in feet
 * @param finalAlt desired altitude at final waypoint in feet
 * @param point1 first point to clamp to
 * @param point2 second point to clamp to
 * @param DEBUG_MODE whether or not to print debug info (false by default)
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function RigidCheck(star: Star, cruise: number, finalAlt: number, point1: Point, point2: Point, DEBUG_MODE = false) {
    const vcalc = new Vcalc();
    const revLegs = star.legs.slice().reverse();

    let point1DistFromEnd = 0;
    for (const leg of revLegs) {
        if (leg.endPoint === revLegs[0].endPoint && leg.endPoint === point1) {
            break;
        }
        point1DistFromEnd += leg.length;
        if (leg.startPoint === point1) {
            break;
        }
    }

    let point2DistFromEnd = 0;
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
    let calcAlt: number;
    let wptDistFromEnd = 0;
    let des = new Map().set('LEGS', []);
    if (DEBUG_MODE) { console.log(`Required Angle:                                 ${parseFloat(requiredAngle.toFixed(3))}`) }
    for (let index = 0; index < revLegs.length; index++) {
        const leg = revLegs[index];
        const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];
        if (DEBUG_MODE) {
            console.log(`\nLeg:`.padEnd(49, ' ') + `${leg.name}\n`
                + `Leg Starting Waypoint:`.padEnd(48, ' ') + `${leg.startPoint.name}\n`
                + `Leg Terminal Waypoint:`.padEnd(48, ' ') + `${leg.endPoint.name}\n`
                + `Leg Length:`.padEnd(48, ' ') + `${leg.length}\n`
                + `${leg.startPoint.name} Top Constraint:`.padEnd(48, ' ') + `${leg.startPoint.tops}\n`
                + `${leg.startPoint.name} Bottom Constraint:`.padEnd(48, ' ') + `${leg.startPoint.bottoms}`
            );
        }

        if (index === 0) {
            calcAlt = vcalc.pointSlopeAlt(0, requiredAngle, point1DistFromEnd, point1.tops);
            if (DEBUG_MODE) {
                console.log(`${leg.endPoint.name} Calculated Altitude:`.padEnd(48, ' ') + `${Math.round(calcAlt)}`)
            };
            if (!(calcAlt >= leg.endPoint.bottoms && calcAlt <= leg.endPoint.tops)) {
                return undefined;
            }
            des.get('LEGS').unshift([leg.endPoint.name, Math.round(calcAlt), undefined]);
        }

        wptDistFromEnd += leg.length;
        calcAlt = vcalc.pointSlopeAlt(wptDistFromEnd, requiredAngle, point1DistFromEnd, point1.tops);
        if (DEBUG_MODE) { console.log(`${leg.startPoint.name} Calculated Altitude:`.padEnd(48, ' ') + `${Math.round(calcAlt)}`) };
        if (!(Math.round(calcAlt) >= constraints[0] && Math.round(calcAlt) <= constraints[1])) { // * sorta sus rounding since i dont want to ignore rigid points
            return undefined;
        }
        des.get('LEGS').unshift([leg.startPoint.name, Math.round(calcAlt), parseFloat(requiredAngle.toFixed(3))]);
        des.set('TOD', [parseFloat(vcalc.desDistance(cruise - des.get('LEGS')[0][1], des.get('LEGS')[0][2]).toFixed(1)), des.get('LEGS')[0][2]]);
    }
    return des;
}
