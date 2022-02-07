import { Point } from "../lib/Point";
import { Star } from "../lib/Star";
import { Vcalc } from "../vcalc";

/**
 * @param star Star object
 * @param cruise cruise altitude in feet
 * @param finalAlt desired altitude at final waypoint in feet
 * @param DEBUG_MODE whether or not to print debug info
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function multiFPA(star: Star, cruise: number, finalAlt: number, rigidPoints: Point[], DEBUG_MODE: boolean) {
    const vcalc = new Vcalc();
    let angles: number[] = [];
    {
        let a = 0;
        while (a < 7) {
            a = parseFloat((a + 0.1).toFixed(1));
            angles.push(a);
        }
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

    let idealAngle = parseFloat(vcalc.desAngle(star.length, firstTargetAltitude - finalAlt).toFixed(1));
    let alt = finalAlt;
    let currentAngle = idealAngle;
    const revLegs = star.legs.slice().reverse();
    let calcAlt: number;
    let distToEnd = star.length;
    let des = new Map().set('LEGS', []); // [startpoint, alt, leg fpa]

    for (let index = 0; index < revLegs.length; index++) {
        const leg = revLegs[index];
        const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];
        idealAngle = vcalc.desAngle(distToEnd, firstTargetAltitude - alt);
        if (DEBUG_MODE) {
            console.log(`\nLeg:`.padEnd(48, ' ') + ` ${leg.name}\n`
                + `Leg Starting Waypoint:`.padEnd(48, ' ') + `${leg.startPoint.name}\n`
                + `Leg Terminal Waypoint:`.padEnd(48, ' ') + `${leg.endPoint.name}\n`
                + `Leg Length:`.padEnd(48, ' ') + `${leg.length}\n`
                + `${leg.startPoint.name} Top Constraint:`.padEnd(48, ' ') + `${leg.startPoint.tops}\n`
                + `${leg.startPoint.name} Bottom Constraint:`.padEnd(48, ' ') + `${leg.startPoint.bottoms}\n`
                + `Distance to end:`.padEnd(48, ' ') + `${distToEnd}`
            );
        }

        if (index === 0) {
            if (DEBUG_MODE) {
                console.log(`${leg.endPoint.name} Calculated Altitude:`.padEnd(48, ' ') + finalAlt);
            }
            des.get('LEGS').unshift([leg.endPoint.name, finalAlt, undefined])
        }

        // Check for rigid points ahead of next waypoint
        {
            let nextRigidPoint: Point;
            for (const l of rigidPoints) {
                if (star.points.slice().reverse().indexOf(l) > star.points.slice().reverse().indexOf(leg.endPoint)) {
                    nextRigidPoint = l;
                    break;
                }
            }
            if (DEBUG_MODE) { try { console.log('Next Rigid Point:'.padEnd(48, ' ') + `${nextRigidPoint.name}`) } catch (error) { console.log('Next Rigid Point:'.padEnd(48, ' ') + 'None') } };
            if (nextRigidPoint !== undefined) {
                let distToNextRigidPoint = 0;
                for (let i = index; i < revLegs.length; i++) {
                    const l = revLegs[i];
                    distToNextRigidPoint += l.length;
                    if (l.startPoint === nextRigidPoint) {
                        break;
                    }
                }
                if (DEBUG_MODE) { console.log(`Distance to ${nextRigidPoint.name}:`.padEnd(48, ' ') + distToNextRigidPoint) }
                const fpa = vcalc.desAngle(distToNextRigidPoint, nextRigidPoint.tops - alt);
                let canSkip = true;
                let i = index;
                let calcAlt: number;

                for (let tempAlt = alt; i < revLegs.length; i++) {
                    const l = revLegs[i];
                    calcAlt = vcalc.altChange(l.length, fpa) + tempAlt;
                    tempAlt = calcAlt;
                    if (!(Math.round(calcAlt) >= l.startPoint.bottoms && Math.round(calcAlt) <= l.startPoint.tops)) {
                        canSkip = false;
                        break;
                    }
                    if (l.startPoint === nextRigidPoint) {
                        break;
                    }
                }
                if (DEBUG_MODE) { console.log(`Can skip to ${nextRigidPoint.name}:`.padEnd(48, ' ') + canSkip) };
                if (canSkip) {
                    for (let j = index, tempAlt = alt; j < revLegs.length; j++) {
                        const l = revLegs[j];
                        let tempCalcAlt = vcalc.altChange(l.length, fpa) + tempAlt
                        des.get('LEGS').unshift([l.startPoint.name, Math.round(tempCalcAlt), parseFloat(fpa.toFixed(3))]);
                        tempAlt = tempCalcAlt
                        if (l.startPoint === nextRigidPoint) {
                            break;
                        }
                    }
                    currentAngle = fpa;
                    index = i;
                    alt = calcAlt;
                    if (DEBUG_MODE) { console.log(`Leg FPA:`.padEnd(48, ' ') + `${parseFloat(currentAngle.toFixed(3))}`) }
                    continue;
                }
            }
        }

        // Check if we can skip to end
        {
            let canSkipToEnd = true;
            for (let i = index, tempAlt = alt; i < revLegs.length; i++) {
                const l = revLegs[i];
                const calcAlt = vcalc.altChange(l.length, idealAngle) + tempAlt;
                if (!(calcAlt >= l.startPoint.bottoms && calcAlt <= l.startPoint.tops)) {
                    canSkipToEnd = false;
                    break;
                }
                tempAlt = calcAlt;
            }

            if (canSkipToEnd) {
                if (DEBUG_MODE) { console.log('Can skip to end:'.padEnd(48, ' ') + 'true') };
                for (let i = index, tempAlt = alt; i < revLegs.length; i++) {
                    const l = revLegs[i];
                    const calcAlt = vcalc.altChange(l.length, idealAngle) + tempAlt;
                    tempAlt = calcAlt;
                    des.get('LEGS').unshift([l.startPoint.name, Math.round(calcAlt), parseFloat(idealAngle.toFixed(3))]);
                }
                des.set('TOD', [parseFloat(vcalc.desDistance(cruise - des.get('LEGS')[0][1], des.get('LEGS')[0][2]).toFixed(1)), des.get('LEGS')[0][2]]);
                return des;
            } else {
                if (DEBUG_MODE) { console.log('Can skip to end:'.padEnd(48, ' ') + 'false') };
            }
        }

        if (vcalc.altChange(leg.length, currentAngle) + alt >= constraints[0] && vcalc.altChange(leg.length, currentAngle) + alt <= constraints[1]) {
            if (DEBUG_MODE) { console.log('Calculating to next point with:'.padEnd(48, ' ') + 'Current Angle') };
            calcAlt = vcalc.altChange(leg.length, currentAngle) + alt;
        }

        else {
            if (DEBUG_MODE) { console.log('Calculating to next point with:'.padEnd(48, ' ') + 'Angle Iteration') };
            let solved: boolean = false;
            let validAngles: number[] = [];

            for (let index = 0; index < angles.length; index++) {
                const angle = angles[index];
                const tempCalcAlt = vcalc.altChange(leg.length, angle) + alt;

                if (tempCalcAlt >= constraints[0] && tempCalcAlt <= constraints[1]) {
                    validAngles.push(angle);
                    solved = true;
                } else if (solved) {
                    break;
                }
            }

            let closestAngle = undefined;

            for (const i of validAngles) {
                if (!closestAngle) {
                    closestAngle = i;
                } else if (Math.abs(parseFloat((idealAngle - i).toFixed(1))) < Math.abs(parseFloat((idealAngle - closestAngle).toFixed(1)))) {
                    closestAngle = i;
                }
            }

            if (DEBUG_MODE) { console.log(`Closest angle to current angle:`.padEnd(48, ' ') + `${closestAngle}`) };
            currentAngle = closestAngle;
            calcAlt = vcalc.altChange(leg.length, closestAngle) + alt;
        }

        if (DEBUG_MODE) {
            console.log(``
                + `Leg FPA:`.padEnd(48, ' ') + `${parseFloat(currentAngle.toFixed(3))}\n`
                + `${leg.startPoint.name} Calculated Altitude:`.padEnd(48, ' ') + `${Math.round(calcAlt)}`);
        }
        distToEnd -= leg.length;
        des.get('LEGS').unshift([leg.startPoint.name, Math.round(calcAlt), parseFloat(currentAngle.toFixed(3))]);
        alt = Math.round(calcAlt);
    }

    des.set('TOD', [parseFloat(vcalc.desDistance(cruise - des.get('LEGS')[0][1], des.get('LEGS')[0][2]).toFixed(1)), des.get('LEGS')[0][2]])
    // ? Should we use a different FPA for the TOD => first point? sorta like idlepath?
    return des;
}
