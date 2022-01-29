import { Star } from "../lib/Star";
import { Vcalc } from "../vcalc";

/**
 * @param star Star object
 * @param cruise cruise altitude in feet
 * @param finalAlt desired altitude at final waypoint in feet
 * @param DEBUG_MODE whether or not to print debug info
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function multiFPA(star:Star, cruise: number, finalAlt: number, DEBUG_MODE: boolean) {
    const vcalc = new Vcalc();

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
    var alt = finalAlt;
    var currentAngle = idealAngle;
    const revLegs = star.legs.slice().reverse();
    var calcAlt: number;
    var legFPAs = new Map();

    // TODO: foresight (look further down path for rigid constriants)
   /**
    * REWRITE PLANS:
    * for each leg:
    *   if current angle => first point works:
    *       calc alts and return
    *   else if required angle to first target alt meets all constraints:
    *       calc alts and return
    *   else if rigid points ahead:
    *       calc angle to rigid point
    *       if angle meets all in between constraints:
    *           calc alts for in between constraints and skip to point
    *   else if next constraint is a window constraint && current angle meets constraints:
    *       calc alt and cont'
    *   else:
    *       angle iter.
    */

   if (DEBUG_MODE) {console.log(`\n================================================================\n`)}
    for (let index = 0; index < revLegs.length; index++) {
        const leg = revLegs[index];
        const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];

        if (DEBUG_MODE) {
            console.log(`\nLeg:                                            ${leg.name}\n`
            + `Leg Starting Waypoint:                          ${leg.startPoint.name}\n`
            + `Leg Terminal Waypoint:                          ${leg.endPoint.name}\n`
            + `Leg Length:                                     ${leg.length}\n`
            + `${leg.startPoint.name} Top Constraint:`.padEnd(48, ' ') + `${leg.startPoint.tops}\n`
            + `${leg.startPoint.name} Bottom Constraint:`.padEnd(48, ' ') + `${leg.startPoint.bottoms}`
            );
        }

        if (constraints[0] == constraints[1]) {
            if (DEBUG_MODE) {console.log('Calculating to next point with:                 Required Angle')};
            const fpa = vcalc.desAngle(leg.length, constraints[0] - alt);
            calcAlt = vcalc.altChange(leg.length, fpa) + alt;
            currentAngle = fpa;
        }

        else if (vcalc.altChange(leg.length, currentAngle) + alt >= constraints[0] && vcalc.altChange(leg.length, currentAngle) + alt <= constraints[1]) {
            if (DEBUG_MODE) {console.log('Calculating to next point with:                 Current Angle')};
            calcAlt = vcalc.altChange(leg.length, currentAngle) + alt;
        }

        else {
            if (DEBUG_MODE) {console.log('Calculating to next point with:                 Angle Iteration')};
            var solved: boolean = false;
            var validAngles: number[] = []; 

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

            var closestAngle = undefined;

            for (const i of validAngles) {
                if (!closestAngle) {
                    closestAngle = i;
                } else if (Math.abs(parseFloat((idealAngle - i).toFixed(1))) < Math.abs(parseFloat((idealAngle - closestAngle).toFixed(1)))) {
                    closestAngle = i;
                }
            }

            if (DEBUG_MODE) {console.log(`Closest angle to ideal angle:                   ${closestAngle}`)};
            currentAngle = closestAngle;
            calcAlt = vcalc.altChange(leg.length, closestAngle) + alt;
        }

        if (DEBUG_MODE) {
            console.log(``
            + `Leg FPA:                                        ${parseFloat(currentAngle.toFixed(3))}\n`
            + `${leg.startPoint.name} Calculated Altitude:`.padEnd(48, ' ') + `${Math.round(calcAlt)}`);
        }

        legFPAs.set(leg.name, new Map().set(leg.startPoint.name, Math.round(calcAlt)).set('LEG FPA', parseFloat(currentAngle.toFixed(3))));
        alt = Math.round(calcAlt);
    }

    if (DEBUG_MODE) {console.log('\n=========================== FINISHED ===========================\n')};

    var des = new Map(Array.from(legFPAs).reverse());
    des.set(star.legs[star.legs.length-1].endPoint.name, finalAlt);
    des.set('TOD', [parseFloat(vcalc.desDistance(cruise - Array.from(Array.from(des)[0][1])[0][1], parseFloat(currentAngle.toFixed(3))).toFixed(1)), parseFloat(currentAngle.toFixed(3))]);
    return des; // TODO: better data return
}
