import { InternalTypes, SensorTypes } from '../mySensors/protocol';

export const SUPPORTED_PRESENTATION_TYPES: `${SensorTypes}`[] = [
  'S_DOOR',
  'S_MOTION',
  'S_BINARY',
  // TODO: 'S_COVER',
  'S_TEMP',
  'S_HUM',
  'S_BARO',
  'S_LIGHT_LEVEL',
  // TODO: 'S_RGB_LIGHT',
  // TODO: 'S_RGBW_LIGHT',
  // TODO: 'S_HVAC',
  'S_MULTIMETER',
];

export const SUPPORTED_INTERNAL_TYPES: `${InternalTypes}`[] = [
  'I_BATTERY_LEVEL',
  // 'I_SKETCH_NAME',
  // 'I_SKETCH_VERSION',
  //'I_PRE_SLEEP_NOTIFICATION',
  // 'I_POST_SLEEP_NOTIFICATION',
];
