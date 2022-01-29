import { Star } from "../lib/Star";

// For MultiFPA alg
export const TRUPS4 = new Star(
    'TRUPS4',
    ['RANJR', 'JARHD', 'PJAAE', 'USAAY', 'WEEDU', 'SUPRT', 'OOURR', 'TRUPS'],
    [
        [28000, 24000],
        [26000, 22000],
        [23000, 21000],
        [21000, 17000],
        [19000, 16000],
        [17000, 14000],
        [13000, 0],
        [11000, 11000]
    ],
    [9, 9, 12, 7, 8, 13, 8]
)

// For rigidCheck Alg
export const NITZR3 = new Star(
    'NITZR3',
    ['KBEEE', 'DEMLL', 'NITZR', 'WRSAW', 'DAHRL', 'GDNEE', 'ELLKO', 'SAVVG', 'GREAK'],
    [
        [100000, 24000],
        [100000, 16000],
        [100000, 12000],
        [100000, 11000],
        [100000, 0],
        [100000, 0],
        [100000, 11000],
        [10000, 10000],
        [8000, 8000]
    ],
    [28, 13, 4, 8, 10, 6, 6, 8]
)

// For pivot Alg (this isn't real i made it up)
export const FAKEE1 = new Star(
    'FAKEE1',
    ['AAAAA', 'BBBBB', 'CCCCC', 'DDDDD', 'EEEEE'],
    [
        [100000, 15000],
        [100000, 13000],
        [12000, 12000],
        [12000, 0],
        [10000, 0]
    ],
    [5, 6, 5, 6]
)

// For Mutli FPA foresight (must force to use multifpa, else will use pivot (and fail))
export const BAYST1 = new Star(
    'BAYST1',
    ['SERCO', 'HUULL', 'GNZZO', 'RYDRR', 'KEVVI', 'BAYST', 'JUSSE', 'CLIFY', 'DWYER', 'AYYYY', 'PETYR'],
    [
        [21000, 19000],
        [20000, 17000],
        [14000, 13000],
        [11000, 11000],
        [100000, 10000],
        [100000, 9000],
        [9000, 8000],
        [8000, 7000],
        [7000, 7000],
        [6000, 6000],
        [5000, 5000]
    ],
    [13, 35, 15, 17, 5, 6, 5, 9, 6, 6]
)
