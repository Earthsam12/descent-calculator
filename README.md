# Descent Calculator
### Simple calculator that can give a descent path and TOD accounting for constraints

## Usage:

N/A for now

## How it works:

There are 3 different methods for calculation:

* Pivot
* Rigid Check
* Multi FPA (please suggest a better name)

### Pivot:
Pivot Executes when there is exactly 1 waypoint in the star that has an 'at' constraint (the top constraint is the same as the bottom constraint).

It uses a point-slope formula to calculate an altitude at any given distance (in NMI) from the end of the STAR.\
![image](https://user-images.githubusercontent.com/93292288/150710306-c7747df4-7de7-4a95-b1d9-18c6f9d3ea26.png)\
Where,
 * `d` is the distance from the end of the path (in NMI) that you want to get the altitude for (essentially `x`),
 * `a` is the flight path angle,
 * `x1` is the distance from the end of the path (in NMI) of the 'pivot point',
 * and `y1` is the 'at' constraint of that point.

Pivot gets it's name from how the line graph looks when the code is executed. The line 'pivots' around the point with the 'at' constraint. It tests each angle 0.1 - 7.0 to see which ones meet all constraints.

After it has checked each angle, it checks if any met all constraints. If there are, then it finds which angle is closest to the 'ideal angle' (direct path between final altitude and the first target altitude - usually the median of the top and bottom constraint of the first waypoint), and returns that as the descent path.

If there were no angles that met all constraints, then Multi FPA is ran.

### Rigid Check:
Rigid Check runs when there are exactly 2 points in the star that have an 'at' constraint.

Rigid Check uses the same formula as Pivot, except that instead of testing each angle, it calculates the 'required angle' between the 2 'rigid' points, then tests to see if that angle meets all constraints. If it does, then that will be returned as the descent path. If it doesn't meet all constraints, then Multi FPA is ran.

### Multi FPA:
Multi FPA is usually used as the 'fallback' in case none of the other methods work. It usually executes when another method returns nothing, or when there is 0 or >2 points with 'at' constraints.

It uses a similar formula as the other methods, but it returns the change in altitude for a given distance and flight path angle, instead of the absolute altitude as the above formula.\
![image](https://user-images.githubusercontent.com/93292288/150712516-d1fab250-23da-45a3-8fe4-e71560c4ec46.png)\
Where,
 * `d` is the distance from the end of the path (in NMI) that you want to get the altitude for (essentially `x`),
 * and `a` is the flight path angle.

The algorithm does not want to change the angle often, and when it must, it wants to change it as little as possible. To do this, there is a 'current angle' which is used and prefered for each loop. The current angle is initialized as the 'ideal angle'.

It starts at the end of the STAR and works backwards. For each leg, it checks what the next constraint is:

 - If the next constraint is an 'at' constraint, it calculates the 'required angle' and sets that as the 'current angle'.
 - If the next constraint is a 'window' constraint, AND the current angle meets those constraints, then it keeps the current angle and calculates the altitude given that angle
 - If the next constraint is a 'window' constraint BUT the current angle didn't meet those constraints, then it runs 'angle iteration' (essentially what Pivot does) and finds what angles meet those constraints, and picks which one is closest to the old angle.
 
 Multi FPA will always return a path, but it may have several different flight path angles for some segments.
 
 ### Flow Chart of Calculation Methods:
 ![image](https://user-images.githubusercontent.com/93292288/150719731-27551302-3ca7-4511-96a5-01d7d3597d36.png)

 
 ## Returned data:
 All functions return a Map with exactly 2 entries:
 * `'LEGS'`
   * Array of Arrays for each leg in the STAR, defined by it's startpoint.
     * `[<point name>, <calculated alt at point>, <Leg FPA to be flown after passing that point>]`
 * `'TOD'`
   * Array of 2 items containing the Top Of Descent Point's distance to the first point.
     * `[<TOD distance to first point>, <FPA from TOD to first point>]`
 
 The map will look something like this: 
 ```ts
 Map(2) {
  'LEGS' => [
    [ 'SERCO', 19687, 1.3 ],
    [ 'HUULL', 17894, 1.3 ],
    [ 'GNZZO', 13068, 1.3 ],
    [ 'RYDRR', 11000, 0.542 ],
    [ 'KEVVI', 10023, 1.7 ],
    [ 'BAYST', 9121, 1 ],
    [ 'JUSSE', 8485, 1 ],
    [ 'CLIFY', 7955, 1 ],
    [ 'DWYER', 7000, 1.571 ],
    [ 'AYYYY', 6000, 1.571 ],
    [ 'PETYR', 5000, undefined ]
  ],
  'TOD' => [ 140.1, 1.3 ]
}
```
The last Array in the `'LEGS'` entry has `undefined` for it's FPA value. This is because no FPA is calculated for that leg as it is the last leg in the STAR. 

### Parsing the data
If for some reason you want to parse the data:
```ts
const des = calcDes(STAR, 39000, 9000);
const legs = des.get('LEGS'); // Array of legs as defined before
const TOD = des.get('TOD')[0]; // Top Of Descent distance from first waypoint

// Getting first leg:
legs[0];

// Getting last leg:
legs[legs.length-1];
// OR:
legs.slice().reverse()[0];

// Getting a specific leg by it's start point:
const legIWant = 'BAYST';
for (const i of legs) {
  if (i[0] === legIWant) {
    legIWant = i;
    break;
  }
}

for (const leg of legs) {
  // Getting leg start point's name:
  leg[0];

  // Getting calculated altitude at the leg start point:
  leg[1];

  // Getting Leg FPA:
  leg[2];
}

```

## Future Work:
 * GUI Functionality
 * MultiFPA 'foresight' (ability to evaluate constraints at points beyond the next one)
 * Nav Database with ability to select and insert STAR data.
 
