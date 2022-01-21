import { Star } from "./lib/Star";
import { Vcalc } from "./vcalc";
import { multiFPA } from "./Methods/multiFPA";
import { Pivot } from "./Methods/pivot";
import { RigidCheck } from "./Methods/rigidCheck";

export function calcDes(star: Star, cruise: number, finalAlt: number) {
    const vcalc = new Vcalc();
    
    if (finalAlt > star.legs[star.legs.length-1].endPoint.tops || finalAlt < star.legs[star.legs.length-1].endPoint.bottoms) {
        console.log('Overwriting finalAlt because of constraints'); // for debugging
        finalAlt = (star.legs[star.legs.length-1].endPoint.tops + star.legs[star.legs.length-1].endPoint.bottoms) / 2;
    }
    
    var rigidPoints = [];
    for (const leg of star.legs) {
        if (leg.startPoint.tops === leg.startPoint.bottoms) {
            rigidPoints.push(leg.startPoint);
        }
    }

    if (rigidPoints.length === 2) {
        var result = RigidCheck(star, cruise, finalAlt, rigidPoints[0], rigidPoints[1]);  
    } else if (rigidPoints.length === 1) {
        var result = Pivot(star, cruise, finalAlt, rigidPoints[0]);
    } else {
        return multiFPA(star, cruise, finalAlt); // Although called multiFPA, this function may return only 1 FPA.
    }

    if (result.size === 0) {
        return multiFPA(star, cruise, finalAlt);
    } else {
        return result;
    }
}



// FOR TESTING

import { TRUPS4 } from "./devData/test_star_data";
console.log(calcDes(TRUPS4, 39000, 11000));
