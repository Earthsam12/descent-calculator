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
    for (const i of revLegs) {
        if (i.startPoint === pivotPoint) {
            pivotPointDistFromEnd += i.length;
            break;
        }
        pivotPointDistFromEnd += i.length;
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
            if (leg.startPoint === pivotPoint) {continue};

            if (index === 0) {
                calcAlt = vcalc.offsetAltChange(0, angle, pivotPointDistFromEnd, pivotPoint.tops);
                if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.endPoint.name}`)};
                // tODO: dATA!!!1111!!
                /**
                 * * The issue here is that the last point in the star (revLegs index 0) is actually being considered.
                 * * Which means that the des map that is returned will be very fucky because that point will be there
                 * * When it usually isn't
                 * TODO: fix it lmao
                 * */
            }

            calcAlt = vcalc.offsetAltChange(wptDistFromEnd, angle, pivotPointDistFromEnd, pivotPoint.tops);
            if (DEBUG_MODE) {console.log(`${calcAlt.toFixed(0)} @ ${leg.startPoint.name}`)};
            if (!(calcAlt > constraints[0] && calcAlt < constraints[1])) {
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
    // * check geogebra: https://www.geogebra.org/calculator/rcwh9jru
    
    // TODO: pivot
    // TODO: final alt = vcalc.offsetAltChange with 0 as x
    return des.set('bruheg', 'eeeeeee'); // TODO: Rememeber to return an empty map if angle(s) didn't work
}
