# Descent Calculator
### Simple calculator that can give FPA(s) and TOD accounting for constraints

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
 - If the next constraint is a 'window' constraint BUT the current angle didn't meet those constraints, then it runs 'angle iteration' (essentially what Pivot does) and finds what angles meet those constraints, and picks which one is closest to the ideal angle.
 
 Multi FPA will always return a path, but it may have several different flight path angles for some segments.
 
 ### Flow Chart of Calculation Methods:
 ![image](https://user-images.githubusercontent.com/93292288/150715347-e894ba77-11bd-47f6-85ae-9ca61fa16afc.png)

 
 ## Dealing with the returned data:
 The data that is returned is pretty hard to work with and parse (as seen by my horrendous descent tree printing code in `index.ts`).
 
 Here's what the `Map` object will usually look like:
 
 ```ts
 Map(9) {
  'RANJR_JARHD' => Map(2) { 'RANJR' => 25705, 'LEG FPA' => 2.1 },
  'JARHD_PJAAE' => Map(2) { 'JARHD' => 23700, 'LEG FPA' => 2.1 },
  'PJAAE_USAAY' => Map(2) { 'PJAAE' => 21694, 'LEG FPA' => 2.1 },
  'USAAY_WEEDU' => Map(2) { 'USAAY' => 19021, 'LEG FPA' => 2.1 },
  'WEEDU_SUPRT' => Map(2) { 'WEEDU' => 17461, 'LEG FPA' => 2.1 },
  'SUPRT_OOURR' => Map(2) { 'SUPRT' => 15679, 'LEG FPA' => 2.1 },
  'OOURR_TRUPS' => Map(2) { 'OOURR' => 12782, 'LEG FPA' => 2.1 },
  'TRUPS' => 11000,
  'TOD' => [ 59.7, 2.1 ]
}
```

The `key` of each entry is the leg name (`<startPointName>_<endPointName>`).\
The `value` of each entry is another `Map`, with 2 values each:
 * The leg's start point's name => Calculated altitude for that point
 * 'LEG FPA' => The flight path angle that the leg should be flown at

There are 2 extra values at the end that do not comply to these standards:

 * Final point's name => Final point's calculated altitude
 * 'TOD' => Array containing the Top Of Descent's distance from the first point, and the flight path angle from TOD to the first point

## Future Work:
 * GUI Functionality
 * MultiFPA 'foresight' (ability to evaluate constraints at points beyond the next one)
 * Nav Database with ability to select and insert STAR data.
 
