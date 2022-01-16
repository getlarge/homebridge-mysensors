import { Commands } from './protocol';

export type MySensorsCommand = {
  Type: `${Commands}`;
  value: number;
  description: string;
};

export type MySensorsCommands = {
  [key in `${Commands}`]: MySensorsCommand;
};

/**
 * Labels used in Mysensors message to identify commands.
 *
 * @namespace
 * @property {string}  Type - [MySensors]{@link /mysensors/#mysensorsapi} Type
 * @property {number}  value - MySensors Type value ( used by transport )
 * @property {string}  description - MySensors Type description
 */
export const commands: MySensorsCommands = {
  presentation: {
    Type: 'presentation',
    value: 0, //  Object.values(Commands).indexOf(Commands.presentation);
    description:
      'Sent by a node when they present attached sensors. This is usually done in the presentation() function which runs at startup.',
  },
  set: {
    Type: 'set',
    value: 1,
    description:
      'This message is sent from or to a sensor when a sensor value should be updated.',
  },
  req: {
    Type: 'req',
    value: 2,
    description:
      'Requests a variable value (usually from an actuator destined for controller).',
  },
  internal: {
    Type: 'internal',
    value: 3,
    description:
      'This is a special internal message. See table below for the details.',
  },
  stream: {
    Type: 'stream',
    value: 4,
    description: 'Used for OTA firmware updates',
  },
};
