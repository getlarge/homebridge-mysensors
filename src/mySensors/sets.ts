import { SensorTypes, Units, VariableTypes } from './protocol';

export type MySensorsSet = {
  Type: `${VariableTypes}`;
  value: number;
  Unit: `${Units}` | null;
  description: string;
  sensorTypes: `${SensorTypes}`[] | ['*'];
};

export type MySensorsSets = {
  [key in `${VariableTypes}`]: MySensorsSet;
};

/**
 * Labels used in Mysensors message to identify sensor type in Set/req commands.
 *
 * @namespace
 * @property {string}  Type - MySensors subtype
 * @property {number}  value - MySensors Subype value ( used by transport )
 * @property {object}  omaResources - [OMA Resources]{@link /mysensors/#omaresources} attached to `labelsPresentation[0].omaObject`
 * @property {string}  Unit - Sensor value unit
 * @property {string}  description - MySensors Subtype description
 * @property {string[]}  sensorTypes - MySensors Type(s) using this variable
 */
export const sets: MySensorsSets = {
  V_TEMP: {
    Type: 'V_TEMP',
    value: 0,
    Unit: '°C',
    description: 'Temperature',
    sensorTypes: ['S_TEMP', 'S_HEATER', 'S_HVAC', 'S_WATER_QUALITY'],
  },
  V_HUM: {
    Type: 'V_HUM',
    value: 1,
    Unit: '%',
    description: 'Humidity',
    sensorTypes: ['S_HUM'],
  },
  V_STATUS: {
    Type: 'V_STATUS',
    value: 2,
    Unit: null,
    description: 'Binary status. 0=off 1=on',
    sensorTypes: [
      'S_BINARY',
      'S_DIMMER',
      'S_SPRINKLER',
      'S_HVAC',
      'S_HEATER',
      'S_WATER_QUALITY',
    ],
  },
  V_PERCENTAGE: {
    Type: 'V_PERCENTAGE',
    value: 3,
    Unit: '%',
    description: 'Percentage value. 0-100 (%)',
    sensorTypes: ['S_DIMMER', 'S_COVER'],
  },
  V_PRESSURE: {
    Type: 'V_PRESSURE',
    value: 4,
    Unit: 'Pa',
    description: 'Atmospheric Pressure',
    sensorTypes: ['S_BARO'],
  },
  V_FORECAST: {
    Type: 'V_FORECAST',
    value: 5,
    Unit: null,
    description:
      'Wheather forecast. One of "stable", "sunny", "cloudy", "unstable", "thunderstorm" or "unknown',
    sensorTypes: ['S_BARO'],
  },
  V_RAIN: {
    Type: 'V_RAIN',
    value: 6,
    Unit: 'mm',
    description: 'Amount of rain',
    sensorTypes: ['S_RAIN'],
  },
  V_RAINRATE: {
    Type: 'V_RAINRATE',
    value: 7,
    Unit: 'mm/d',
    description: 'Rate of rain',
    sensorTypes: ['S_RAIN'],
  },
  V_WIND: {
    Type: 'V_WIND',
    value: 8,
    Unit: null,
    description: 'Windspeed',
    sensorTypes: ['S_WIND'],
  },
  V_GUST: {
    Type: 'V_GUST',
    value: 9,
    Unit: null,
    description: 'Gust',
    sensorTypes: ['S_WIND'],
  },
  V_DIRECTION: {
    Type: 'V_DIRECTION',
    value: 10,
    Unit: null,
    description: 'Wind direction 0-360 (degrees)',
    sensorTypes: ['S_WIND'],
  },
  V_UV: {
    Type: 'V_UV',
    value: 11,
    Unit: null,
    description: 'UV light level',
    sensorTypes: ['S_UV'],
  },
  V_WEIGHT: {
    Type: 'V_WEIGHT',
    value: 12,
    Unit: 'kg',
    description: 'Weight (for scales etc)',
    sensorTypes: ['S_WEIGHT'],
  },
  V_DISTANCE: {
    Type: 'V_DISTANCE',
    value: 13,
    Unit: 'm',
    description: 'Distance',
    sensorTypes: ['S_DISTANCE'],
  },
  V_IMPEDANCE: {
    Type: 'V_IMPEDANCE',
    value: 14,
    Unit: null,
    description: 'Impedance value',
    sensorTypes: ['S_MULTIMETER', 'S_WEIGHT'],
  },
  V_ARMED: {
    Type: 'V_ARMED',
    value: 15,
    Unit: null,
    description: 'Armed status of a security sensor. 1=Armed, 0=Bypassed',
    sensorTypes: [
      'S_DOOR',
      'S_MOTION',
      'S_SMOKE',
      'S_SPRINKLER',
      'S_WATER_LEAK',
      'S_SOUND',
      'S_VIBRATION',
      'S_MOISTURE',
    ],
  },
  V_TRIPPED: {
    Type: 'V_TRIPPED',
    value: 16,
    Unit: null,
    description: 'Tripped status of a security sensor. 1=Tripped, 0=Untripped',
    sensorTypes: [
      'S_DOOR',
      'S_MOTION',
      'S_SMOKE',
      'S_SPRINKLER',
      'S_WATER_LEAK',
      'S_SOUND',
      'S_VIBRATION',
      'S_MOISTURE',
    ],
  },
  V_WATT: {
    Type: 'V_WATT',
    value: 17,
    Unit: 'W',
    description: 'Watt value for power meters',
    sensorTypes: [
      'S_POWER',
      'S_BINARY',
      'S_DIMMER',
      'S_RGB_LIGHT',
      'S_RGBW_LIGHT',
    ],
  },
  V_KWH: {
    Type: 'V_KWH',
    value: 18,
    Unit: 'kWh',
    description: 'Accumulated number of KWH for a power meter',
    sensorTypes: ['S_POWER'],
  },
  V_SCENE_ON: {
    Type: 'V_SCENE_ON',
    value: 19,
    Unit: null,
    description: 'Turn on a scene',
    sensorTypes: ['S_SCENE_CONTROLLER'],
  },
  V_SCENE_OFF: {
    Type: 'V_SCENE_OFF',
    value: 20,
    Unit: null,
    description: 'Turn of a scene',
    sensorTypes: ['S_SCENE_CONTROLLER'],
  },
  V_HVAC_FLOW_STATE: {
    Type: 'V_HVAC_FLOW_STATE',
    value: 21,
    Unit: null,
    description:
      'Mode of header - One of "Off", "HeatOn", "CoolOn", or "AutoChangeOver',
    sensorTypes: ['S_HVAC', 'S_HEATER'],
  },
  V_HVAC_SPEED: {
    Type: 'V_HVAC_SPEED',
    value: 22,
    Unit: null,
    description: 'HVAC/Heater fan speed ("Min", "Normal", "Max", "Auto")',
    sensorTypes: ['S_HVAC', 'S_HEATER'],
  },
  V_LIGHT_LEVEL: {
    Type: 'V_LIGHT_LEVEL',
    value: 23,
    Unit: null,
    description:
      'Uncalibrated light level 0-100% ( Use V_LEVEL for light level in lux.)',
    sensorTypes: ['S_LIGHT_LEVEL'],
  },
  V_VAR1: {
    Type: 'V_VAR1',
    value: 24,
    Unit: null,
    description: 'Custom value',
    sensorTypes: ['*'],
  },
  V_VAR2: {
    Type: 'V_VAR2',
    value: 25,
    Unit: null,
    description: 'Custom value',
    sensorTypes: ['*'],
  },
  V_VAR3: {
    Type: 'V_VAR3',
    value: 26,
    Unit: null,
    description: 'Custom value',
    sensorTypes: ['*'],
  },
  V_VAR4: {
    Type: 'V_VAR4',
    value: 27,
    Unit: null,
    description: 'Custom value',
    sensorTypes: ['*'],
  },
  V_VAR5: {
    Type: 'V_VAR5',
    value: 28,
    Unit: null,
    description: 'Custom value',
    sensorTypes: ['*'],
  },
  V_UP: {
    Type: 'V_UP',
    value: 29,
    Unit: null,
    description: 'Window covering. Up.',
    sensorTypes: ['S_COVER'],
  },
  V_DOWN: {
    Type: 'V_DOWN',
    value: 30,
    Unit: null,
    description: 'Window covering. Down.',
    sensorTypes: ['S_COVER'],
  },
  V_STOP: {
    Type: 'V_STOP',
    value: 31,
    Unit: null,
    description: 'Window covering. Stop.',
    sensorTypes: ['S_COVER'],
  },
  V_IR_SEND: {
    Type: 'V_IR_SEND',
    value: 32,
    Unit: null,
    description: 'Send out an IR-command',
    sensorTypes: ['S_IR'],
  },
  V_IR_RECEIVE: {
    Type: 'V_IR_RECEIVE',
    value: 33,
    Unit: null,
    description: 'This message contains a received IR-command',
    sensorTypes: ['S_IR'],
  },
  V_FLOW: {
    Type: 'V_FLOW',
    value: 34,
    Unit: 'm',
    description: 'Flow of water (in meter)',
    sensorTypes: ['S_WATER'],
  },
  V_VOLUME: {
    Type: 'V_VOLUME',
    value: 35,
    Unit: null,
    description: 'Water volume',
    sensorTypes: ['S_WATER'],
  },
  V_LOCK_STATUS: {
    Type: 'V_LOCK_STATUS',
    value: 36,
    Unit: null,
    description: 'Set or get lock status. 1=Locked, 0=Unlocked',
    sensorTypes: ['S_LOCK'],
  },
  V_LEVEL: {
    Type: 'V_LEVEL',
    value: 37,
    Unit: null,
    description: 'Used for sending level-value',
    sensorTypes: [
      'S_DUST',
      'S_AIR_QUALITY',
      'S_SOUND',
      'S_VIBRATION',
      'S_LIGHT_LEVEL',
    ],
  },
  V_VOLTAGE: {
    Type: 'V_VOLTAGE',
    value: 38,
    Unit: 'V',
    description: 'Voltage level',
    sensorTypes: ['S_MULTIMETER'],
  },
  V_CURRENT: {
    Type: 'V_CURRENT',
    value: 39,
    Unit: null,
    description: 'Current level',
    sensorTypes: ['S_MULTIMETER'],
  },
  V_RGB: {
    Type: 'V_RGB',
    value: 40,
    Unit: null,
    description:
      'RGB value transmitted as ASCII hex string (I.e "ff0000" for red)',
    sensorTypes: ['S_RGB_LIGHT', 'S_COLOR_SENSOR'],
  },
  V_RGBW: {
    Type: 'V_RGBW',
    value: 41,
    Unit: null,
    description:
      'RGBW value transmitted as ASCII hex string (I.e "ff0000ff" for red + full white)',
    sensorTypes: ['S_RGBW_LIGHT'],
  },
  V_ID: {
    Type: 'V_ID',
    value: 42,
    Unit: null,
    description: 'Optional unique sensor id (e.g. OneWire DS1820b ids)',
    sensorTypes: ['S_TEMP'],
  },
  V_UNIT_PREFIX: {
    Type: 'V_UNIT_PREFIX',
    value: 43,
    Unit: null,
    description: `Allows sensors to send in a string representing the unit prefix to be displayed in GUI. 
    This is not parsed by controller! E.g. cm, m, km, inch.`,
    sensorTypes: ['S_DISTANCE', 'S_DUST', 'S_AIR_QUALITY'],
  },
  V_HVAC_SETPOINT_COOL: {
    Type: 'V_HVAC_SETPOINT_COOL',
    value: 44,
    Unit: null,
    description: 'HVAC cold setpoint',
    sensorTypes: ['S_HVAC'],
  },
  V_HVAC_SETPOINT_HEAT: {
    Type: 'V_HVAC_SETPOINT_HEAT',
    value: 45,
    Unit: null,
    description: 'HVAC/Heater setpoint',
    sensorTypes: ['S_HVAC', 'S_HEATER'],
  },
  V_HVAC_FLOW_MODE: {
    Type: 'V_HVAC_FLOW_MODE',
    value: 46,
    Unit: null,
    description: 'Flow mode for HVAC ("Auto", "ContinuousOn", "PeriodicOn")',
    sensorTypes: ['S_HVAC'],
  },
  V_TEXT: {
    Type: 'V_TEXT',
    value: 47,
    Unit: null,
    description: 'Text message to display on LCD or controller device',
    sensorTypes: ['S_INFO'],
  },
  V_CUSTOM: {
    Type: 'V_CUSTOM',
    value: 48,
    Unit: null,
    description:
      'Custom messages used for controller/inter node specific commands, preferably using S_CUSTOM device type.',
    sensorTypes: ['S_CUSTOM'],
  },
  V_POSITION: {
    Type: 'V_POSITION',
    value: 49,
    Unit: null,
    description:
      'GPS position and altitude. Payload: latitude;longitude;altitude(m). E.g. "55.722526;13.017972;18',
    sensorTypes: ['S_GPS'],
  },
  V_IR_RECORD: {
    Type: 'V_IR_RECORD',
    value: 50,
    Unit: null,
    description: 'Record IR codes S_IR for playback',
    sensorTypes: ['S_IR'],
  },
  V_PH: {
    Type: 'V_PH',
    value: 51,
    Unit: null,
    description: 'Water PH',
    sensorTypes: ['S_WATER_QUALITY'],
  },
  V_ORP: {
    Type: 'V_ORP',
    value: 52,
    Unit: 'mV',
    description: 'Water ORP : redox potential in mV',
    sensorTypes: ['S_WATER_QUALITY'],
  },
  V_EC: {
    Type: 'V_EC',
    value: 53,
    Unit: 'ms/cm',
    description: 'Water electric conductivity mS/cm (microSiemens/cm)',
    sensorTypes: ['S_WATER_QUALITY'],
  },
  V_VAR: {
    Type: 'V_VAR',
    value: 54,
    Unit: null,
    description: 'Reactive power: volt-ampere reactive (var)',
    sensorTypes: ['S_POWER'],
  },
  V_VA: {
    Type: 'V_VA',
    value: 55,
    Unit: 'VA',
    description: 'Apparent power: volt-ampere (VA)',
    sensorTypes: ['S_POWER'],
  },
  V_POWER_FACTOR: {
    Type: 'V_POWER_FACTOR',
    value: 56,
    Unit: null,
    description:
      'Ratio of real power to apparent power: floating point value in the range [-1,..,1]',
    sensorTypes: ['S_POWER'],
  },
};
