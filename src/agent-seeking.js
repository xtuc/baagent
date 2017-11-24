import {vector} from 'bytearena-sdk';

const isAgent = x => x.tag  === 'agent';

const Vector2 = vector.Vector2;

export function computeAgentSeekingForces({vision}) {

  return vision
    .filter(isAgent)
    .slice(0, 1)
    .map(x => {
      return Vector2.fromArray(x.center);
    });
}
