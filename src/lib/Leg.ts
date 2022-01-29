import { Point } from "./Point";

export class Leg {
    name: string;
    startPoint: Point;
    endPoint: Point;
    length: number;
    constructor(startpoint: Point, endpoint: Point, length: number) {
        this.name = startpoint.name + "_" + endpoint.name;
        this.startPoint = startpoint;
        this.endPoint = endpoint;
        this.length = length;
    }
}
