import { Star } from "../Classes/Star";
import { Vcalc } from "../vcalc";

export function multiFPA(star:Star, cruise: number, finalAlt: number) {
    const vcalc = new Vcalc();

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
    var index = 0;
    var currentAngle = idealAngle;
    const revLegs = star.legs.slice().reverse();

    for (let index = 0; index < star.legs.length; index++) {
        const leg = star.legs[index];
        const constraints = (leg.startPoint.bottoms, leg.startPoint.tops)

    }


    var des = new Map();
    des.set('RANJR_JARHD', new Map().set('RANJR', 25704).set('LEG FPA', 2.1));
    return des;
}
