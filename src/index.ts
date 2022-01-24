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
    
    if (finalAlt > star.legs[star.legs.length-1].endPoint.tops || finalAlt < star.legs[star.legs.length-1].endPoint.bottoms) {
        if (DEBUG_MODE) {console.log('Overwriting finalAlt because of constraints')};
        finalAlt = (star.legs[star.legs.length-1].endPoint.tops + star.legs[star.legs.length-1].endPoint.bottoms) / 2;
    }
    
    var rigidPoints = [];
    for (let i = 0; i < star.legs.length; i++) {
        const leg = star.legs[i];
        if (leg.endPoint === star.points[star.points.length-1] && leg.endPoint.tops === leg.endPoint.bottoms) {
            rigidPoints.push(leg.endPoint);
        }
        if (leg.startPoint.bottoms === leg.startPoint.tops) {
            rigidPoints.push(leg.startPoint);
        }
    }

    if (rigidPoints.length === 2) {
        if (DEBUG_MODE) {console.log('running rigid check')}
        var result = RigidCheck(star, cruise, finalAlt, rigidPoints[0], rigidPoints[1], true);  
    } else if (rigidPoints.length === 1) {
        if (DEBUG_MODE) {console.log('running pivot')}
        var result = Pivot(star, cruise, finalAlt, rigidPoints[0], DEBUG_MODE);
    } else {
        if (DEBUG_MODE) {console.log('running multifpa')}
        return multiFPA(star, cruise, finalAlt, DEBUG_MODE); // Although called multiFPA, this function may return only 1 FPA.
    }

    if (result.size === 0) { // ? Consider making unsuccessful calculations return `undefined` instead of empty map
        if (DEBUG_MODE) {console.log('that failed, running multifpa')}
        return multiFPA(star, cruise, finalAlt, DEBUG_MODE);
    } else {
        return result;
    }
}


// TEMP: FOR TESTING

import { TRUPS4 as STAR } from "./testing/test_star_data";
const des = calcDes(STAR, 39000, 9000, true); // TODO: make --debug an option when doing npm run run, but always on when running npm run dev
// // console.log(des); // TEMP: testing

var desTree: string = ` ╔════════════════TOD: ${des.get('TOD')[0]} NMI from ${Array.from(Array.from(des)[0][1])[0][0]}\n ║ \n${des.get('TOD')[1].toFixed(1)}°\n ║ \n`;
for (const i of Array.from(des)) {
    if (Array.from(i)[0] === Array.from(des.entries())[des.size - 2][0]) {
        desTree += ` ╚════════════════Point: ${i[0]}    Alt: ${i[1]}\n`;
        break;
    }
    desTree += ` ╠════════════════Point: ${i[0].slice(0,5)}    Alt: ${Array.from(i[1])[0][1]}\n`;
    desTree += ' ║ \n'
    desTree += `${i[1].get('LEG FPA').toFixed(1)}°\n`
    desTree += ' ║ \n'
}

console.log(desTree);
