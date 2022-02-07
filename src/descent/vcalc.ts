export class Vcalc {
    /**
     * Descent Distance
     * @param altChange altitude to lose
     * @param angle angle to fly at
     * @returns distance to descend
     */
    desDistance(altChange: number, angle: number) {
        return (altChange / Math.tan((angle * Math.PI) / 180)) * 0.000164579;
    }
    
    /**
     * descent angle
     * @param distance distance to fly
     * @param altChange altitude to lose
     * @returns angle required to lose given distance at given FPA
     */
    desAngle(distance: number, altChange: number) {
        return (Math.atan(altChange / (distance * 6076.12)) * 180) / Math.PI;
    }

    /**
     * change in altitude
     * @param distance distance to fly
     * @param angle angle to fly
     * @returns change in altitude for the given distance and angle
     */
    altChange(distance: number, angle: number) {
        return (Math.tan((angle * Math.PI) / 180) * distance) / 0.000164579;
    }

    /**
     * solves a point-slope equation for x
     * @param distance 'x' / distance from end of star
     * @param angle fpa
     * @param x1 rigid point distance from end of star
     * @param y1 rigid point altitude constraint
     * @returns absolute altitude at given x value
     */
    pointSlopeAlt(distance: number, angle: number, x1: number, y1: number) {
        return ((Math.tan((angle * Math.PI) / 180) * (distance - x1)) / 0.000164579) + y1;
    }
}
