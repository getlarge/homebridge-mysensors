import { InternalTypes } from './protocol';

export type MySensorsInternal = {
  Type: `${InternalTypes}`;
  value: number;
  description: string;
};

export type MySensorsInternals = {
  [key in `${InternalTypes}`]: MySensorsInternal;
};

/**
 * Labels used in Mysensors message to identify sensor type in Internal commands.
 *
 * @namespace
 * @property {string}  Type - MySensors subtype
 * @property {number}  value - MySensors Subype value ( used by transport )
 * @property {string}  description - MySensors Subtype description
 */
export const internals: MySensorsInternals = {
  I_BATTERY_LEVEL: {
    Type: 'I_BATTERY_LEVEL',
    value: 0,
    description: 'Use this to report the battery level (in percent 0-100).',
  },
  I_TIME: {
    Type: 'I_TIME',
    value: 1,
    description:
      'Sensors can request the current time from the Controller using this message. The time will be reported as the seconds since 1970',
  },
  I_VERSION: {
    Type: 'I_VERSION',
    value: 2,
    description: 'Used to request gateway version from controller.',
  },
  I_ID_REQUEST: {
    Type: 'I_ID_REQUEST',
    value: 3,
    description: 'Use this to request a unique node id from the controller.',
  },
  I_ID_RESPONSE: {
    Type: 'I_ID_RESPONSE',
    value: 4,
    description: 'Id response back to node. Payload contains node id.',
  },
  I_INCLUSION_MODE: {
    Type: 'I_INCLUSION_MODE',
    value: 5,
    description:
      'Start/stop inclusion mode of the Controller (1=start, 0=stop).',
  },
  I_CONFIG: {
    Type: 'I_CONFIG',
    value: 6,
    description:
      'Config request from node. Reply with (M)etric or (I)mperal back to sensor.',
  },
  I_FIND_PARENT: {
    Type: 'I_FIND_PARENT',
    value: 7,
    description:
      'When a sensor starts up, it broadcast a search request to all neighbor nodes. They reply with a I_FIND_PARENT_RESPONSE.',
  },
  I_FIND_PARENT_RESPONSE: {
    Type: 'I_FIND_PARENT_RESPONSE',
    value: 8,
    description: 'Reply message type to I_FIND_PARENT request.',
  },
  I_LOG_MESSAGE: {
    Type: 'I_LOG_MESSAGE',
    value: 9,
    description: 'Sent by the gateway to the Controller to trace-log a message',
  },
  I_CHILDREN: {
    Type: 'I_CHILDREN',
    value: 10,
    description:
      'A message that can be used to transfer child sensors (from EEPROM routing table) of a repeating node.',
  },
  I_SKETCH_NAME: {
    Type: 'I_SKETCH_NAME',
    value: 11,
    description:
      'Optional sketch name that can be used to identify sensor in the Controller GUI',
  },
  I_SKETCH_VERSION: {
    Type: 'I_SKETCH_VERSION',
    value: 12,
    description:
      'Optional sketch version that can be reported to keep track of the version of sensor in the Controller GUI.',
  },
  I_REBOOT: {
    Type: 'I_REBOOT',
    value: 13,
    description: 'Used by OTA firmware updates. Request for node to reboot.',
  },
  I_GATEWAY_READY: {
    Type: 'I_GATEWAY_READY',
    value: 14,
    description: 'Send by gateway to controller when startup is complete.',
  },
  I_SIGNING_PRESENTATION: {
    Type: 'I_SIGNING_PRESENTATION',
    value: 15,
    description:
      'Provides signing related preferences (first byte is preference version).',
  },
  I_NONCE_REQUEST: {
    Type: 'I_NONCE_REQUEST',
    value: 16,
    description: 'Used between sensors when requesting nonce.',
  },
  I_NONCE_RESPONSE: {
    Type: 'I_NONCE_RESPONSE',
    value: 17,
    description: 'Used between sensors for nonce response.',
  },
  I_HEARTBEAT_REQUEST: {
    Type: 'I_HEARTBEAT_REQUEST',
    value: 18,
    description: 'Heartbeat request',
  },
  I_PRESENTATION: {
    Type: 'I_PRESENTATION',
    value: 19,
    description: 'Presentation message',
  },
  I_DISCOVER_REQUEST: {
    Type: 'I_DISCOVER_REQUEST',
    value: 20,
    description: 'Discover request',
  },
  I_DISCOVER_RESPONSE: {
    Type: 'I_DISCOVER_RESPONSE',
    value: 21,
    description: 'Discover response',
  },
  I_HEARTBEAT_RESPONSE: {
    Type: 'I_HEARTBEAT_RESPONSE',
    value: 22,
    description: 'Heartbeat response',
  },
  I_LOCKED: {
    Type: 'I_LOCKED',
    value: 23,
    description: 'Node is locked (reason in string-payload)',
  },
  I_PING: {
    Type: 'I_PING',
    value: 24,
    description: 'Ping sent to node, payload incremental hop counter',
  },
  I_PONG: {
    Type: 'I_PONG',
    value: 25,
    description:
      'In return to ping, sent back to sender, payload incremental hop counter',
  },
  I_REGISTRATION_REQUEST: {
    Type: 'I_REGISTRATION_REQUEST',
    value: 26,
    description: 'Register request to GW',
  },
  I_REGISTRATION_RESPONSE: {
    Type: 'I_REGISTRATION_RESPONSE',
    value: 27,
    description: 'Register response from GW',
  },
  I_DEBUG: {
    Type: 'I_DEBUG',
    value: 28,
    description: 'Debug message',
  },
  I_SIGNAL_REPORT_REQUEST: {
    Type: 'I_SIGNAL_REPORT_REQUEST',
    value: 29,
    description: 'Device signal strength request',
  },
  I_SIGNAL_REPORT_REVERSE: {
    Type: 'I_SIGNAL_REPORT_REVERSE',
    value: 30,
    description: 'Internal',
  },
  I_SIGNAL_REPORT_RESPONSE: {
    Type: 'I_SIGNAL_REPORT_RESPONSE',
    value: 31,
    description: 'Device signal strength response (RSSI)',
  },
  I_PRE_SLEEP_NOTIFICATION: {
    Type: 'I_PRE_SLEEP_NOTIFICATION',
    value: 32,
    description: 'Message sent before node is going to sleep',
  },
  I_POST_SLEEP_NOTIFICATION: {
    Type: 'I_POST_SLEEP_NOTIFICATION',
    value: 33,
    description: 'Message sent after node woke up (if enabled)',
  },
};
