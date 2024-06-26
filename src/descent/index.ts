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
        if (DEBUG_MODE) { console.log('\nOverwriting finalAlt because of constraints') };
        finalAlt = (star.legs[star.legs.length - 1].endPoint.tops + star.legs[star.legs.length - 1].endPoint.bottoms) / 2;
    }

    if (star.legs[star.legs.length-1].endPoint.tops === 100000 && star.legs[star.legs.length-1].endPoint.bottoms === 0) {
        star.legs[star.legs.length-1].endPoint.tops = finalAlt;
        star.legs[star.legs.length-1].endPoint.bottoms = finalAlt;
    }
    
    let rigidPoints = [];
    for (let i = 0; i < star.legs.slice().reverse().length; i++) {
        const leg = star.legs.slice().reverse()[i];
        if (leg.endPoint === star.points[star.points.length - 1] && leg.endPoint.tops === leg.endPoint.bottoms) {
            rigidPoints.push(leg.endPoint);
        }
        if (leg.startPoint.bottoms === leg.startPoint.tops) {
            rigidPoints.push(leg.startPoint);
        }
    }

    let result: Map<any, any> | undefined;
    if (rigidPoints.length === 2) {
        if (DEBUG_MODE) { console.log('\nRunning Rigid Check') }
        result = RigidCheck(star, cruise, finalAlt, rigidPoints[0], rigidPoints[1], DEBUG_MODE);
    } else if (rigidPoints.length === 1) {
        if (DEBUG_MODE) { console.log('\nRunning Pivot') }
        result = Pivot(star, cruise, finalAlt, rigidPoints[0], DEBUG_MODE);
    } else {
        if (DEBUG_MODE) { console.log('\nRunning MultiFPA') }
        return multiFPA(star, cruise, finalAlt, rigidPoints, DEBUG_MODE); // Although called multiFPA, this function may return only 1 FPA.
    }

    if (!result) {
        if (DEBUG_MODE) { console.log('\nFailed, Running MultiFPA...') }
        return multiFPA(star, cruise, finalAlt, rigidPoints, DEBUG_MODE);
    } else {
        return result;
    }
}

let DEBUG_MODE = false;
if (process.argv.slice(2).toString().indexOf('debug') !== -1 && process.argv.slice(2).toString().indexOf('no-debug') === -1) {
    DEBUG_MODE = true;
}

let TXT_IN = false; // TEMP: txtin is temp until GUI is finished
if (process.argv.slice(2).toString().indexOf('txt-in') !== -1) {
    TXT_IN = true;
}

import { BAYST1 as importStar } from "./testing/test_star_data";
import { inputStar } from "../input/input";

let STAR: Star;
if (TXT_IN) {
    STAR = inputStar;
} else {
    STAR = importStar;
}

const des = calcDes(STAR, 39000, 1500, DEBUG_MODE);
if (DEBUG_MODE) { console.log(des) };
let desTree: string = ` ╔════════════════TOD: ${des.get('TOD')[0]} NMI from ${des.get('LEGS')[0][0]}\n ║ \n${des.get('TOD')[1].toFixed(1)}°\n ║ \n`;
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
