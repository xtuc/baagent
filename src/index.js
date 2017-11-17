import {vector, comm} from 'bytearena-sdk';
import process from 'process';

const Vector2 = vector.Vector2;
const agent = comm.connect();

const forwardVector = new Vector2(0, 1);

const CLOSE_DISTANCE = 10;

let specs = null;

agent.on('welcome', welcome => {
  specs = welcome;
})

agent.on('perception', perception => {
  const force = forwardVector.clone()
  const currentVelocity = Vector2.fromArray(perception.velocity);

  const avoidanceForceArray = computeAvoidanceForces(perception);
  const avoidanceForce = mergeVectors(avoidanceForceArray);

  avoidanceForce
    .sub(currentVelocity);

  force
    .add(avoidanceForce)
    .mag(specs.maxsteeringforce);

  assert(Number.isNaN(force.x) === false)
  assert(Number.isNaN(force.y) === false)

  agent.takeActions([
    { method: 'steer', arguments: force.toArray(5) }
  ]);
});

function computeAvoidanceForces({vision}) {

  return vision
    .filter(isObjectable)
    .map(obj => {
      const centervec = Vector2.fromArray(obj.center);

      if (isClose(centervec)) {
        return inverseVector(centervec);
      } else {
        return getNullVector();
      }
    });
}

function assert(cond) {
  if (cond === false) {
    throw new Error("Assert error")
  }
}

const isObjectable = x => x.tag === 'obstacle';
const inverseVector = x => x.mult(-1);
const getNullVector = () => new Vector2(0, 0).clone();
const addVectors = (a, b) => a.add(b);
const mergeVectors = vs => vs.reduce(addVectors, getNullVector());
const isClose = v => v.mag() < CLOSE_DISTANCE;
