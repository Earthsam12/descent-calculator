import { Star } from "../lib/Star";

// For MultiFPA alg
export const TRUPS4 = new Star(
    'TRUPS4',
    [
        'RANJR', 
        'JARHD', 
        'PJAAE', 
        'USAAY', 
        'WEEDU', 
        'SUPRT', 
        'OOURR', 
        'TRUPS'
    ],
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
    [
        'KBEEE',
        'DEMLL',
        'NITZR',
        'WRSAW',
        'DAHRL',
        'GDNEE',
        'ELLKO',
        'SAVVG',
        'GREAK'
    ],
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

// For Mutli FPA foresight (must force to use multifpa, else will use pivot (and fail))
export const BAYST1 = new Star(
    'BAYST1',
    [
        'SERCO', 
        'HUULL', 
        'GNZZO', 
        'RYDRR', 
        'KEVVI', 
        'BAYST', 
        'JUSSE', 
        'CLIFY', 
        'DWYER', 
        'AYYYY', 
        'PETYR'
    ],
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

// For Mutli FPA foresight (must force to use multifpa, else will use pivot (and fail))
export const BAYST1_shortened_modified = new Star(
    'BAYST1',
    [
        'SERCO', 
        'HUULL', 
        'GNZZO', 
        'RYDRR', 
        'KEVVI', 
        'BAYST'
    ],
    [
        [21000, 19000],
        [20000, 17000],
        [14000, 13000],
        [11000, 11000],
        [100000, 9000],
        [100000, 9000]
    ],
    [13, 35, 15, 17, 5]
)

// for borat
export const CLIPR2 = new Star(
    'CLIPR2',
    [
        'TRISH',
        'CLIPR',
        'BAL',
        'EYESS',
        'EDDWD',
        'MEGGS',
        'NAYES'
    ],
    [
        [12000, 12000],
        [100000, 0],
        [10000, 10000],
        [100000, 0],
        [100000, 0],
        [100000, 0],
        [100000, 0]
    ],
    [4, 20, 16, 6, 5, 8]
);

// for xyz
export const FRDMM5 = new Star(
    'FRDMM5', // Star name
    [ // Names
        'BUCKO',
        'DRRON',
        'HONNR',
        'BRVRY',
        'COURG',
        'PLDGE',
        'WEWIL',
        'NEVVR',
        'FORGT',
        'SEPII',
        'ALWYZ',
        'LETZZ',
        'RLLLL',
        'VCTRY',
        'HEROO'
    ],
    [ // Constraints
        [31000, 31000],
        [31000, 27000],
        [28000, 24000],
        [26000, 22000],
        [23000, 20000],
        [17000, 15000],
        [100000, 14000],
        [100000, 12000],
        [100000, 11000],
        [100000, 10000],
        [10000, 0],
        [8000, 8000],
        [6000, 6000],
        [100000, 0],
        [100000, 0]
    ],
    [12, 15, 13, 11, 17, 12, 6, 7, 5, 5, 10, 8, 10, 8] // Leg lengths
)


// for xyz
export const ALWYS2 = new Star(
    'ALWYS', // Star name
    [ // Names
        'DYAMD',
        'LAANE',
        'ALWYS',
        'HEFLY',
        'ARRTU',
        'ADDMM',
        'COGGR',
        'BERKS'
    ],
    [ // Constraints [tops, bottoms]
        [100000, 27000],
        [26000, 22000],
        [100000, 0],
        [19000, 14000],
        [10000, 10000],
        [9000, 9000],
        [9000, 7000],
        [100000, 5000]
    ],
    [17, 10, 13, 14, 10, 13, 11] // Leg lengths
)

/* .TEMPLATE
// for xyz
export const CLIPR2 = new Star(
    '', // Star name
    [ // Names
        
    ],
    [ // Constraints [tops, bottoms]

    ],
    [] // Leg lengths
)
*/
