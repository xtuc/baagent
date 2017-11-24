import {vector, comm} from 'bytearena-sdk';
import {computeAvoidanceForces} from './avoidance';
import {computeAgentSeekingForces} from './agent-seeking';
import {computeShootForce} from './shoot';
import {CLOSE_DISTANCE} from './config';

const Vector2 = vector.Vector2;
const agent = comm.connect();

const getNullVector = () => new Vector2(0, 0);
const getForwardVector = () => new Vector2(0, 1);
const addVectors = (a, b) => a.add(b);
const mergeVectors = vs => vs.reduce(addVectors, getNullVector());

const clonePerception = ({vision}) => ({
  vision: vision.slice(0),
});

let lastVector = new Vector2(0, 0);
let specs = null;

function arrive(v) {
  const mag = map(v.mag(), 0, CLOSE_DISTANCE, 0, specs.maxsteeringforce);

  return v.clone().mag(mag)
}

function assert(cond) {
  if (cond === false) {
    throw new Error("Assert error")
  }
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

agent.on('welcome', x => (specs = x));

agent.on('perception', perception => {
  const actions = [];
  const force = getForwardVector();
  const currentVelocity = Vector2.fromArray(perception.velocity);

  const avoidanceForceArray = computeAvoidanceForces(clonePerception(perception));

  if (avoidanceForceArray.length > 0) {
    const avoidanceForce = mergeVectors(avoidanceForceArray);

    /*
     * It seems that some walls are flickering
     * to mitigate that we add the vector with the vector at n-1
     */
    avoidanceForce.add(lastVector)

    lastVector = avoidanceForce

    force.add(avoidanceForce);
  }

  const agentSeekingForceArray = computeAgentSeekingForces(clonePerception(perception));

  if (agentSeekingForceArray.length > 0) {
    const seekingForce = mergeVectors(agentSeekingForceArray);

    seekingForce.mult(1000);

    force.add(seekingForce);
  }

  force.mag(specs.maxsteeringforce);

  assert(Number.isNaN(force.x) === false);
  assert(Number.isNaN(force.y) === false);

  const shootForces = computeShootForce(clonePerception(perception));

  if (shootForces.length > 0) {

    actions.push({
      method: 'shoot',
      arguments: shootForces[0].toArray(5),
    });
  }

  actions.push({
    method: 'steer',
    arguments: force.toArray(5)
  });

  agent.takeActions(actions);
});
