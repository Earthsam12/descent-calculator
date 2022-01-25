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
     * constatly check if required angle from alt => first target alt works
     * ^ unless there are rigid points ahead, in which case
     * check if required angle from alt => rigid point works
     * if so, skip to that point
     * if not, cont' as normal
     * then after skipping to that point, check if another rigid point ahead and do same to that point if so
     * else try to see if angle from ppos to last point @ first target altitude works
     * if it does then cool star over
     * else cont' as normal
     * this should reduce the # of different fpas
     */
    /**
     * if (required angle => first target alt meets cstrs) {
     *  use that, calc alts and return
     * }
     * if (rigid points ahead) {
     *   if (required angle to next rigid point meets all in between constraints) {
     *      skip to that point; continue (so that we check if we can skip to the end again)
     *   }
     *   else {cont as normal}
     * }
     */

    for (let index = 0; index < revLegs.length; index++) {
        const leg = revLegs[index];
        const constraints = [leg.startPoint.bottoms, leg.startPoint.tops];

        // Decide what to do based on next constraint

        // If next constraint is rigid
        if (constraints[0] == constraints[1]) {
            if (DEBUG_MODE) {console.log(' * Constraint is rigid; calculating required angle')};
            const fpa = vcalc.desAngle(leg.length, constraints[0] - alt);
            calcAlt = vcalc.altChange(leg.length, fpa) + alt;
            currentAngle = fpa;
        }

        // If next constraint is a window constraint and current angle meets said constraints
        else if (vcalc.altChange(leg.length, currentAngle) + alt >= constraints[0] && vcalc.altChange(leg.length, currentAngle) + alt <= constraints[1]) {
            if (DEBUG_MODE) {console.log(` * Current angle meets constraints; calculating with current angle (${currentAngle})`)};
            calcAlt = vcalc.altChange(leg.length, currentAngle) + alt;
        }

        // If neither condition was true (so the constraint is a window constraint, and current angle didn't meet them), run angle iteration
        else {
            if (DEBUG_MODE) {console.log(' * Current angle doesn\'t work; Running angle iteration')};
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
                    if (DEBUG_MODE) {console.log(" *- Closer angle to idealangle found")};
                    closestAngle = i;
                }
            }

            currentAngle = closestAngle;
            calcAlt = vcalc.altChange(leg.length, closestAngle) + alt;
        }

        if (DEBUG_MODE) {console.log(`FPA: ${currentAngle}`)};
        if (DEBUG_MODE) {console.log(`${Math.round(calcAlt)} at ${leg.startPoint.name}`)};
        if (DEBUG_MODE) {
            console.log(`
Leg:                                            ${leg.name}
Leg Starting Waypoint:                          ${leg.startPoint.name}
Leg Terminal Waypoint:                          ${leg.endPoint.name}
Leg Length:                                     ${leg.length}
${leg.startPoint.name} Top Constraint:          ${leg.startPoint.tops}
${leg.startPoint.name} Bottom Constraint:       ${leg.startPoint.bottoms}
${leg.startPoint.name} Calculated Altitude:     ${calcAlt}\
`); /** FIXME: spacing!!! */
        }

        legFPAs.set(leg.name, new Map().set(leg.startPoint.name, Math.round(calcAlt)).set('LEG FPA', parseFloat(currentAngle.toFixed(3))));
        alt = Math.round(calcAlt);
    }
    if (DEBUG_MODE) {console.log("================================")};

    var des = new Map(Array.from(legFPAs).reverse());
    des.set(star.legs[star.legs.length-1].endPoint.name, finalAlt);
    des.set('TOD', [parseFloat(vcalc.desDistance(cruise - Array.from(Array.from(des)[0][1])[0][1], parseFloat(currentAngle.toFixed(3))).toFixed(1)), parseFloat(currentAngle.toFixed(3))]);

    // TODO: better debug for all methods:
    /**
     * print("Leg:                       {}".format(leg.name))
     * print("Leg Starting Waypoint:     {}".format(leg.startPoint.name))
     * print("Leg Terminal Waypoint:     {}".format(leg.endPoint.name))
     * print("{} Top Altitude:        {}".format(leg.startPoint.name, maxx))
     * print("{} Bottom Altitude:     {}".format(leg.startPoint.name, mins))
     * print("Leg Length:                {}".format(dist))
     * print("{} Calculated Altitude: {}".format(leg.startPoint.name, round(alt + vcalc.altChange(dist, angle))))
     * print("Meets Constraints:         {}".format(round(alt + vcalc.altChange(dist, angle)) in range(mins, maxx + 1)))
     * 
     * this is from des calculator v0.1.1
     */
    return des; // TODO: better data return
}
