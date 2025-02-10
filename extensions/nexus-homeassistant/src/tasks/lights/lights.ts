import { get } from '../lights/lights.get.js';

import { turnOff } from './lights.turn-off.js';
import { turnOn } from './lights.turn-on.js';

const lights = {
  get,
  turnOn,
  turnOff,
};

export { lights };
