import { SensorTypes, VariableTypes } from './protocol';

export type MySensorsPresentation = {
  Type: `${SensorTypes}`;
  value: number;
  description: string;
  resources: `${VariableTypes}`[];
};

export type MySensorsPresentations = {
  [key in `${SensorTypes}`]: MySensorsPresentation;
};

/**
 * Labels used in Mysensors message to identify sensor type in presentation commands.
 *
 * @namespace
 * @property {string}  Type - [MySensors]{@link /mysensors/#mysensorsapi} Type
 * @property {number}  value - MySensors Type value ( used by transport )
 * @property {string}  description - MySensors Type description
 * @property {string[]}  resources - MySensors variable subtype used by this type
 */
export const presentations: MySensorsPresentations = {
  S_DOOR: {
    Type: 'S_DOOR',
    value: 0,
    description: 'Door and window sensors',
    resources: ['V_TRIPPED', 'V_ARMED'],
  },
  S_MOTION: {
    Type: 'S_MOTION',
    value: 1,
    description: 'Motion sensors',
    resources: ['V_TRIPPED', 'V_ARMED'],
  },
  S_SMOKE: {
    Type: 'S_SMOKE',
    value: 2,
    description: 'Smoke sensor',
    resources: ['V_TRIPPED', 'V_ARMED'],
  },
  S_BINARY: {
    Type: 'S_BINARY',
    value: 3,
    description: 'Binary device (on/off)',
    resources: ['V_STATUS', 'V_WATT'],
  },
  S_DIMMER: {
    Type: 'S_DIMMER',
    value: 4,
    description: 'Dimmable device of some kind',
    resources: ['V_STATUS', 'V_PERCENTAGE', 'V_WATT'],
  },
  S_COVER: {
    Type: 'S_COVER',
    value: 5,
    description: 'Window covers or shades',
    resources: ['V_UP', 'V_DOWN', 'V_STOP', 'V_PERCENTAGE'],
  },
  S_TEMP: {
    Type: 'S_TEMP',
    value: 6,
    description: 'Temperature sensor',
    resources: ['V_TEMP', 'V_ID'],
  },
  S_HUM: {
    Type: 'S_HUM',
    value: 7,
    description: 'Humidity sensor',
    resources: ['V_HUM'],
  },
  S_BARO: {
    Type: 'S_BARO',
    value: 8,
    description: 'Barometer sensor (Pressure)',
    resources: ['V_PRESSURE', 'V_FORECAST'],
  },
  S_WIND: {
    Type: 'S_WIND',
    value: 9,
    description: 'Wind sensor',
    resources: ['V_WIND', 'V_GUST', 'V_DIRECTION'],
  },
  S_RAIN: {
    Type: 'S_RAIN',
    value: 10,
    description: 'Rain sensor',
    resources: ['V_RAIN', 'V_RAINRATE'],
  },
  S_UV: {
    Type: 'S_UV',
    value: 11,
    description: 'UV sensor',
    resources: ['V_UV'],
  },
  S_WEIGHT: {
    Type: 'S_WEIGHT',
    value: 12,
    description: 'Weight sensor for scales etc.',
    resources: ['V_WEIGHT', 'V_IMPEDANCE'],
  },
  S_POWER: {
    Type: 'S_POWER',
    value: 13,
    description: 'Power measuring device, like power meters',
    resources: ['V_WATT', 'V_KWH', 'V_VAR', 'V_VA', 'V_POWER_FACTOR'],
  },
  S_HEATER: {
    Type: 'S_HEATER',
    value: 14,
    description: 'Heater device',
    resources: [
      'V_HVAC_SETPOINT_HEAT',
      'V_HVAC_FLOW_STATE',
      'V_TEMP',
      'V_STATUS',
    ],
  },
  S_DISTANCE: {
    Type: 'S_DISTANCE',
    value: 15,
    description: 'Distance sensor',
    resources: ['V_DISTANCE', 'V_UNIT_PREFIX'],
  },
  S_LIGHT_LEVEL: {
    Type: 'S_LIGHT_LEVEL',
    value: 16,
    description: 'Light sensor',
    resources: [
      'V_LIGHT_LEVEL', // uncalibrated percentage
      'V_LEVEL', // light level in lux
    ],
  },
  S_ARDUINO_NODE: {
    Type: 'S_ARDUINO_NODE',
    value: 17,
    description: 'Arduino node device',
    resources: [],
  },
  S_ARDUINO_REPEATER_NODE: {
    Type: 'S_ARDUINO_REPEATER_NODE',
    value: 18,
    description: 'Arduino repeating node device',
    resources: [],
  },
  S_LOCK: {
    Type: 'S_LOCK',
    value: 19,
    description: 'Lock device',
    resources: ['V_LOCK_STATUS'],
  },
  S_IR: {
    Type: 'S_IR',
    value: 20,
    description: 'Ir sender/receiver device',
    resources: ['V_IR_SEND', 'V_IR_RECEIVE', 'V_IR_RECORD'],
  },
  S_WATER: {
    Type: 'S_WATER',
    value: 21,
    description: 'Water meter',
    resources: ['V_FLOW', 'V_VOLUME'],
  },
  S_AIR_QUALITY: {
    Type: 'S_AIR_QUALITY',
    value: 22,
    description: 'Air quality sensor e.g. MQ-2',
    resources: ['V_LEVEL', 'V_UNIT_PREFIX'],
  },
  S_CUSTOM: {
    Type: 'S_CUSTOM',
    value: 23,
    description: 'Use this for custom sensors where no other fits.',
    resources: [],
  },
  S_DUST: {
    Type: 'S_DUST',
    value: 24,
    description: 'Dust level sensor',
    resources: ['V_LEVEL', 'V_UNIT_PREFIX'],
  },
  S_SCENE_CONTROLLER: {
    Type: 'S_SCENE_CONTROLLER',
    value: 25,
    description: 'Scene controller device',
    resources: ['V_SCENE_ON', 'V_SCENE_OFF'],
  },
  S_RGB_LIGHT: {
    Type: 'S_RGB_LIGHT',
    value: 26,
    description: 'RGB light',
    resources: ['V_RGB', 'V_WATT'],
  },
  S_RGBW_LIGHT: {
    Type: 'S_RGBW_LIGHT',
    value: 27,
    description: 'RGBW light (with separate white component)',
    resources: ['V_RGBW', 'V_WATT'],
  },
  S_COLOR_SENSOR: {
    Type: 'S_COLOR_SENSOR',
    value: 28,
    description: 'Color sensor',
    resources: ['V_RGB'],
  },
  S_HVAC: {
    Type: 'S_HVAC',
    value: 29,
    description: 'Thermostat/HVAC device',
    resources: [
      'V_STATUS',
      'V_TEMP',
      'V_HVAC_SETPOINT_HEAT',
      'V_HVAC_SETPOINT_COOL',
      'V_HVAC_FLOW_STATE',
      'V_HVAC_FLOW_MODE',
      'V_HVAC_SPEED',
    ],
  },
  S_MULTIMETER: {
    Type: 'S_MULTIMETER',
    value: 30,
    description: 'Multimeter device',
    resources: ['V_VOLTAGE', 'V_CURRENT', 'V_IMPEDANCE'],
  },
  S_SPRINKLER: {
    Type: 'S_SPRINKLER',
    value: 31,
    description: 'Sprinkler device',
    resources: ['V_STATUS', 'V_TRIPPED'],
  },
  S_WATER_LEAK: {
    Type: 'S_WATER_LEAK',
    value: 32,
    description: 'Water leak sensor',
    resources: ['V_TRIPPED', 'V_ARMED'],
  },
  S_SOUND: {
    Type: 'S_SOUND',
    value: 33,
    description: 'Sound sensor',
    resources: ['V_LEVEL', 'V_TRIPPED', 'V_ARMED'],
  },
  S_VIBRATION: {
    Type: 'S_VIBRATION',
    value: 34,
    description: 'Vibration sensor',
    resources: ['V_LEVEL', 'V_TRIPPED', 'V_ARMED'],
  },
  S_MOISTURE: {
    Type: 'S_MOISTURE',
    value: 35,
    description: 'Moisture sensor',
    resources: ['V_LEVEL', 'V_TRIPPED', 'V_ARMED'],
  },
  S_INFO: {
    Type: 'S_INFO',
    value: 36,
    description: 'LCD text device',
    resources: ['V_TEXT'],
  },
  S_GAS: {
    Type: 'S_GAS',
    value: 37,
    description: 'Gas meter',
    resources: ['V_FLOW', 'V_VOLUME'],
  },
  S_GPS: {
    Type: 'S_GPS',
    value: 38,
    description: 'GPS Sensor',
    resources: ['V_POSITION'],
  },
  S_WATER_QUALITY: {
    Type: 'S_WATER_QUALITY',
    value: 39,
    description: 'Water quality sensor',
    resources: ['V_TEMP', 'V_PH', 'V_ORP', 'V_EC', 'V_STATUS'],
  },
};
