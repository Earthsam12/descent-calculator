export class Vcalc {
    desDistance(altChange: number, angle: number) {
        return (altChange / Math.tan((angle * Math.PI) / 180)) * 0.000164579;
    }
    desAngle(distance: number, altChange: number) {
        return (Math.atan(altChange / (distance * 6076.12)) * 180) / Math.PI;
    }
    altChange(distance: number, angle: number) {
        return (Math.tan((angle * Math.PI) / 180) * distance) / 0.000164579;
    }
    pointSlopeAlt(distance: number, angle: number, x1: number, y1: number) {
        return ((Math.tan((angle * Math.PI) / 180) * (distance - x1)) / 0.000164579) + y1;
    }
}
