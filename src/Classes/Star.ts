import { Leg } from "./Leg";
import { Point } from "./Point";

export class Star {
    starName: string;
    pointNames: string[];
    constraints: number[][];
    legLengths: number[];
    points: Point[];
    legs: Leg[]
    constructor (starName: string, pointNames: string[], constraints: number[][], legLengths: any) {
        this.starName = starName;
        this.pointNames = pointNames;
        this.constraints = constraints;
        this.legLengths = legLengths;

        this.points = [];
        let k = 0;
        for (let Name of this.pointNames) {;
            this.points.push(new Point(Name, this.constraints[k][0], this.constraints[k][1]));
            k++
        }

        this.legs = [];
        k = 0;
        for (let point of this.points) {
            try {
                this.legs.push(new Leg(point, this.points[k+1], this.legLengths[k]));
                k++;
            } catch (TypeError) {
                break;
            }
        }
    }
    length() {
        let len = 0;
        for (let leg of this.legs) {
            len += leg.length;
        }
        return len
    }
}
