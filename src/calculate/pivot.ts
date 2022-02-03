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
export function Pivot(star: Star, cruise: number, finalAlt: number, pivotPoint: Point, DEBUG_MODE = false) {
    const vcalc = new Vcalc();

    let angles: number[] = [];
    let a = 0;
    while (a < 7) {
        a = parseFloat((a + 0.1).toFixed(1));
        angles.push(a);
    }

    let firstTargetAltitude: number;
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
    let calcAlt: number;

    let pivotPointDistFromEnd = 0;
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
    let validAngles = [];
    let solved = false;
    let wptDistFromEnd = 0;
    for (const angle of angles) {
        if (DEBUG_MODE) { console.log(`Testing angle:`.padEnd(48, ' ') + `${angle}`) };

        let isValidAngle = true;

        for (let index = 0; index < revLegs.length; index++) {
            const leg = revLegs[index];
            const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];
            wptDistFromEnd += leg.length;

            if (DEBUG_MODE) {
                console.log(`Leg:`.padEnd(48, ' ') + `${leg.name}\n`
                    + `Leg Starting Waypoint:`.padEnd(48, ' ') + `${leg.startPoint.name}\n`
                    + `Leg Terminal Waypoint:`.padEnd(48, ' ') + `${leg.endPoint.name}\n`
                    + `Leg Length:`.padEnd(48, ' ') + `${leg.length}\n`
                    + `${leg.startPoint.name} Top Constraint:`.padEnd(48, ' ') + `${leg.startPoint.tops}\n`
                    + `${leg.startPoint.name} Bottom Constraint:`.padEnd(48, ' ') + `${leg.startPoint.bottoms}`
                );
            }

            if (index === 0) {
                calcAlt = vcalc.pointSlopeAlt(0, angle, pivotPointDistFromEnd, pivotPoint.tops);
                if (!(Math.round(calcAlt) >= revLegs[0].endPoint.bottoms && Math.round(calcAlt) <= revLegs[0].endPoint.tops)) {
                    isValidAngle = false;
                    break;
                }
                if (DEBUG_MODE) {
                    console.log(`${leg.endPoint.name} Calculated Altitude:`.padEnd(48, ' ') + `${Math.round(calcAlt)}`);
                }
            }

            calcAlt = vcalc.pointSlopeAlt(wptDistFromEnd, angle, pivotPointDistFromEnd, pivotPoint.tops);
            if (DEBUG_MODE) { console.log(`${leg.startPoint.name} Calculated Altitude:`.padEnd(48, ' ') + `${Math.round(calcAlt)}\n`) };
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
        return undefined;
    }

    let closestAngle = undefined;
    for (const i of validAngles) {
        if (!closestAngle) {
            closestAngle = i;
        } else if (Math.abs(parseFloat((idealAngle - i).toFixed(1))) < Math.abs(parseFloat((idealAngle - closestAngle).toFixed(1)))) {
            closestAngle = i;
        }
    }

    if (DEBUG_MODE) { console.log(`Closest angle to ideal angle:`.padEnd(48, ' ') + `${closestAngle}`) };
    let des = new Map().set('LEGS', []);
    wptDistFromEnd = 0;
    for (const leg of revLegs) {
        if (wptDistFromEnd === 0) {
            des.get('LEGS').unshift([revLegs[0].endPoint.name, Math.round(vcalc.pointSlopeAlt(0, closestAngle, pivotPointDistFromEnd, pivotPoint.tops)), undefined]);
        }
        wptDistFromEnd += leg.length;
        des.get('LEGS').unshift([leg.startPoint.name, Math.round(vcalc.pointSlopeAlt(wptDistFromEnd, closestAngle, pivotPointDistFromEnd, pivotPoint.tops)), closestAngle])
    }
    des.set('TOD', [parseFloat(vcalc.desDistance(cruise - des.get('LEGS')[0][1], des.get('LEGS')[0][2]).toFixed(1)), des.get('LEGS')[0][2]]);
    return des;
}
