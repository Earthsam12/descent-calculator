import { Star } from "../descent/lib/Star";
import fs from 'fs';
import path from "path";

/**
 * 
 * @param text string of star data in <LEG_START_POINT_NAME>:<TOPS>,<BOTTOMS>,<LEG_LENGTH>; format
 * @returns STAR object
 */
export const createStarFromText = (text: string) => {
    text = text.replaceAll(' ', '');
    if (text[text.length-1] === ';') {
        text = text.slice(0, text.length-1);
    }
    let points = [];
    let constraints = [];
    let legLengths = [];
    const entries = text.split(';');
    for (const entry of entries) {
        const data = (entry.slice(entry.indexOf(':')+1)).split(',');
        const name = entry.slice(0, entry.indexOf(':'));
        const cstrs = [parseInt(data[0]), parseInt(data[1])];
        if (data[2] === '!') {
            points.push(name);
            constraints.push(cstrs);
            break;
        }
        const legLength = parseInt(data[2]);
        points.push(name);
        constraints.push(cstrs);
        legLengths.push(legLength);
    }
    return new Star('ALWYS2', points, constraints, legLengths);
}

export const inputStar = createStarFromText(fs.readFileSync(path.resolve(__dirname, "./input.txt")).toString());
