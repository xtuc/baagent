import {vector, comm} from 'bytearena-sdk';
import {CLOSE_DISTANCE} from './config';

const isObjectable = x => x.tag === 'obstacle';
const inverseVector = x => x.mult(-1);
const isClose = v => v.mag() < CLOSE_DISTANCE;
const takeCenter = p => p.center;
const byClosest = (a, b) => a.mag() > b.mag();

const Vector2 = vector.Vector2;

function toArray(acc, obj) {
  acc.push(obj.nearedge);
  acc.push(obj.center);
  acc.push(obj.faredge);

  return acc;
}
export function computeAvoidanceForces({vision}) {

  return vision
    .filter(isObjectable)
    .reduce(toArray, [])
    .map(Vector2.fromArray)
    .sort(byClosest)
    .reduce((acc, centervec) => {

      if (isClose(centervec)) {
        acc.push(
          inverseVector(centervec)
        );
      }

      return acc;
    }, []);
}
