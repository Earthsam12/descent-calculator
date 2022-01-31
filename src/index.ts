import { Star } from "./lib/Star";
import { Vcalc } from "./vcalc";
import { multiFPA } from "./calculate/multiFPA";
import { Pivot } from "./calculate/pivot";
import { RigidCheck } from "./calculate/rigidCheck";

/**
 * @param star Star object
 * @param cruise cruise altitude in feet
 * @param finalAlt desired altitude at final waypoint in feet
 * @param DEBUG_MODE whether or not to print debug info
 * @returns Map of leg FPAs and predicted altitudes + top of descent and final alt
 */
export function calcDes(star: Star, cruise: number, finalAlt: number, DEBUG_MODE = false) {
    const vcalc = new Vcalc();

    if (finalAlt > star.legs[star.legs.length - 1].endPoint.tops || finalAlt < star.legs[star.legs.length - 1].endPoint.bottoms) {
        if (DEBUG_MODE) { console.log('\n --------- Overwriting finalAlt because of constraints --------- ') };
        finalAlt = (star.legs[star.legs.length - 1].endPoint.tops + star.legs[star.legs.length - 1].endPoint.bottoms) / 2;
    }

    var rigidPoints = [];
    for (let i = 0; i < star.legs.length; i++) {
        const leg = star.legs[i];
        if (leg.endPoint === star.points[star.points.length - 1] && leg.endPoint.tops === leg.endPoint.bottoms) {
            rigidPoints.push(leg.endPoint);
        }
        if (leg.startPoint.bottoms === leg.startPoint.tops) {
            rigidPoints.push(leg.startPoint);
        }
    }
    var result: Map<any, any> | undefined;
    if (rigidPoints.length === 2) {
        if (DEBUG_MODE) { console.log('\nRunning Rigid Check') }
        result = RigidCheck(star, cruise, finalAlt, rigidPoints[0], rigidPoints[1], true);
    } else if (rigidPoints.length === 1) {
        if (DEBUG_MODE) { console.log('\nRunning Pivot') }
        result = Pivot(star, cruise, finalAlt, rigidPoints[0], DEBUG_MODE);
    } else {
        if (DEBUG_MODE) { console.log('\nRunning MultiFPA') }
        return multiFPA(star, cruise, finalAlt, DEBUG_MODE); // Although called multiFPA, this function may return only 1 FPA.
    }

    if (!result) {
        if (DEBUG_MODE) { console.log('\nFailed, Running MultiFPA...') }
        return multiFPA(star, cruise, finalAlt, DEBUG_MODE);
    } else {
        return result;
    }
}

var DEBUG_MODE = false;
if (process.argv.slice(2).toString().indexOf('debug') !== -1) {
    DEBUG_MODE = true;
}

// TEMP BELOW: FOR TESTING

import { BAYST1 as STAR } from "./testing/test_star_data";
const des = calcDes(STAR, 39000, 9000, DEBUG_MODE);
if (DEBUG_MODE) { console.log(des) };

var desTree: string = ` ╔════════════════TOD: ${des.get('TOD')[0]} NMI from ${des.get('LEGS')[0][0]}\n ║ \n${des.get('TOD')[1].toFixed(1)}°\n ║ \n`;
for (const i of des.get('LEGS')) {
    if (!i[2]) {
        desTree += ` ╚════════════════Point: ${i[0]}    Alt: ${i[1]}\n`;
        break;
    }
    desTree += ` ╠════════════════Point: ${i[0]}    Alt: ${i[1]}\n`;
    desTree += ' ║ \n'
    desTree += `${i[2].toFixed(1)}°\n`
    desTree += ' ║ \n'
}

console.log(desTree);
