import {vector} from 'bytearena-sdk';

const isAgent = x => x.tag  === 'agent';

const Vector2 = vector.Vector2;

export function computeShootForce({vision}) {

  return vision
    .filter(isAgent)
    .slice(0, 1)
    .map(x => {
      const centervec = Vector2.fromArray(x.center);
      const velocity = Vector2.fromArray(x.velocity);

      return centervec.add(velocity);
    });
}
