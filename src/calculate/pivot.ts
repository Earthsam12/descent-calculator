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
export function Pivot(star:Star, cruise: number, finalAlt: number, pivotPoint: Point, DEBUG_MODE = false) {
    const vcalc = new Vcalc();
    var des = new Map();

    var angles: number[] = [];
    var a = 0;
    while (a < 7) {
        a = parseFloat((a + 0.1).toFixed(1));
        angles.push(a);
    }

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
    const revLegs = star.legs.slice().reverse();
    var calcAlt: number;

    var pivotPointDistFromEnd = 0;
    for (let i = 0; i < revLegs.length; i++) {
        const leg = revLegs[i];
        if (i === 0) {
            if (leg.endPoint === pivotPoint) {
                break;
            }
        }
        pivotPointDistFromEnd += leg.length;
        if (leg.startPoint === pivotPoint) {
            break;
        }
    }
    var validAngles = [];
    var solved = false;
    for (const angle of angles) {
        if (DEBUG_MODE) {console.log("================================")}
        if (DEBUG_MODE) {console.log(`testing angle ${angle.toFixed(1)}`)}
        var wptDistFromEnd = 0;
        var isValidAngle = true
        for (let index = 0; index < revLegs.length; index++) {
            const leg = revLegs[index];
            const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];
            wptDistFromEnd += leg.length;

            if (index === 0) {
                calcAlt = vcalc.pointSlopeAlt(0, angle, pivotPointDistFromEnd, pivotPoint.tops);
                if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.endPoint.name}`)};
                if (!(calcAlt >= leg.endPoint.bottoms && calcAlt <= leg.endPoint.tops)) {
                    isValidAngle = false;
                    break;
                }
            }

            calcAlt = vcalc.pointSlopeAlt(wptDistFromEnd, angle, pivotPointDistFromEnd, pivotPoint.tops);
            if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.startPoint.name}`)};
            if (!(calcAlt >= constraints[0] && calcAlt <= constraints[1])) {
                isValidAngle = false;
                break;
            }
        }
        if (isValidAngle) {
            validAngles.push(angle);
            solved = true;
        } else if (solved) {
            break;
        }
    }
    if (validAngles.length === 0) {
        return new Map();
    }
    var closestAngle = undefined;
        for (const i of validAngles) {
            if (!closestAngle) {
                closestAngle = i;
            } else if (Math.abs(parseFloat((idealAngle - i).toFixed(1))) < Math.abs(parseFloat((idealAngle - closestAngle).toFixed(1)))) {
                if (DEBUG_MODE) {console.log("closer angle to idealangle found")}; // FIXME: this probably needs a fix
                closestAngle = i;
            }
        }

    if (DEBUG_MODE) {console.log(`Best angle: ${closestAngle}`)};
    // data stuff
    wptDistFromEnd = 0;
    for (const leg of revLegs) {
        wptDistFromEnd += leg.length;
        des.set(leg.name, new Map().set(leg.startPoint.name, Math.round(vcalc.pointSlopeAlt(wptDistFromEnd, closestAngle, pivotPointDistFromEnd, pivotPoint.tops))).set('LEG FPA', closestAngle));
    }
    var des = new Map(Array.from(des).reverse());
    des.set(revLegs[0].endPoint.name, Math.round(vcalc.pointSlopeAlt(0, closestAngle, pivotPointDistFromEnd, pivotPoint.tops)));
    des.set('TOD', [parseFloat((vcalc.desDistance(cruise - des.get(star.legs[0].name).get(star.points[0].name), closestAngle).toFixed(1))), closestAngle]);
    return des;
}
