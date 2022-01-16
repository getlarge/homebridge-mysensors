/**
 * MySensors Serial API
 * @external MySensorsAPI
 * @see {@link https://www.mysensors.org/download/serial_api_20}
 */

export enum SensorTypes {
  S_DOOR = 'S_DOOR',
  S_MOTION = 'S_MOTION',
  S_SMOKE = 'S_SMOKE',
  S_BINARY = 'S_BINARY',
  S_DIMMER = 'S_DIMMER',
  S_COVER = 'S_COVER',
  S_TEMP = 'S_TEMP',
  S_HUM = 'S_HUM',
  S_BARO = 'S_BARO',
  S_WIND = 'S_WIND',
  S_RAIN = 'S_RAIN',
  S_UV = 'S_UV',
  S_WEIGHT = 'S_WEIGHT',
  S_POWER = 'S_POWER',
  S_HEATER = 'S_HEATER',
  S_DISTANCE = 'S_DISTANCE',
  S_LIGHT_LEVEL = 'S_LIGHT_LEVEL',
  S_ARDUINO_NODE = 'S_ARDUINO_NODE',
  S_ARDUINO_REPEATER_NODE = 'S_ARDUINO_REPEATER_NODE',
  S_LOCK = 'S_LOCK',
  S_IR = 'S_IR',
  S_WATER = 'S_WATER',
  S_AIR_QUALITY = 'S_AIR_QUALITY',
  S_CUSTOM = 'S_CUSTOM',
  S_DUST = 'S_DUST',
  S_SCENE_CONTROLLER = 'S_SCENE_CONTROLLER',
  S_RGB_LIGHT = 'S_RGB_LIGHT',
  S_RGBW_LIGHT = 'S_RGBW_LIGHT',
  S_COLOR_SENSOR = 'S_COLOR_SENSOR',
  S_HVAC = 'S_HVAC',
  S_MULTIMETER = 'S_MULTIMETER',
  S_SPRINKLER = 'S_SPRINKLER',
  S_WATER_LEAK = 'S_WATER_LEAK',
  S_SOUND = 'S_SOUND',
  S_VIBRATION = 'S_VIBRATION',
  S_MOISTURE = 'S_MOISTURE',
  S_INFO = 'S_INFO',
  S_GAS = 'S_GAS',
  S_GPS = 'S_GPS',
  S_WATER_QUALITY = 'S_WATER_QUALITY',
}

export enum VariableTypes {
  V_TEMP = 'V_TEMP',
  V_HUM = 'V_HUM',
  V_STATUS = 'V_STATUS',
  V_PERCENTAGE = 'V_PERCENTAGE',
  V_PRESSURE = 'V_PRESSURE',
  V_FORECAST = 'V_FORECAST',
  V_RAIN = 'V_RAIN',
  V_RAINRATE = 'V_RAINRATE',
  V_WIND = 'V_WIND',
  V_GUST = 'V_GUST',
  V_DIRECTION = 'V_DIRECTION',
  V_UV = 'V_UV',
  V_WEIGHT = 'V_WEIGHT',
  V_DISTANCE = 'V_DISTANCE',
  V_IMPEDANCE = 'V_IMPEDANCE',
  V_ARMED = 'V_ARMED',
  V_TRIPPED = 'V_TRIPPED',
  V_WATT = 'V_WATT',
  V_KWH = 'V_KWH',
  V_SCENE_ON = 'V_SCENE_ON',
  V_SCENE_OFF = 'V_SCENE_OFF',
  V_HVAC_FLOW_STATE = 'V_HVAC_FLOW_STATE',
  V_HVAC_SPEED = 'V_HVAC_SPEED',
  V_LIGHT_LEVEL = 'V_LIGHT_LEVEL',
  V_VAR1 = 'V_VAR1',
  V_VAR2 = 'V_VAR2',
  V_VAR3 = 'V_VAR3',
  V_VAR4 = 'V_VAR4',
  V_VAR5 = 'V_VAR5',
  V_UP = 'V_UP',
  V_DOWN = 'V_DOWN',
  V_STOP = 'V_STOP',
  V_IR_SEND = 'V_IR_SEND',
  V_IR_RECEIVE = 'V_IR_RECEIVE',
  V_FLOW = 'V_FLOW',
  V_VOLUME = 'V_VOLUME',
  V_LOCK_STATUS = 'V_LOCK_STATUS',
  V_LEVEL = 'V_LEVEL',
  V_VOLTAGE = 'V_VOLTAGE',
  V_CURRENT = 'V_CURRENT',
  V_RGB = 'V_RGB',
  V_RGBW = 'V_RGBW',
  V_ID = 'V_ID',
  V_UNIT_PREFIX = 'V_UNIT_PREFIX',
  V_HVAC_SETPOINT_COOL = 'V_HVAC_SETPOINT_COOL',
  V_HVAC_SETPOINT_HEAT = 'V_HVAC_SETPOINT_HEAT',
  V_HVAC_FLOW_MODE = 'V_HVAC_FLOW_MODE',
  V_TEXT = 'V_TEXT',
  V_CUSTOM = 'V_CUSTOM',
  V_POSITION = 'V_POSITION',
  V_IR_RECORD = 'V_IR_RECORD',
  V_PH = 'V_PH',
  V_ORP = 'V_ORP',
  V_EC = 'V_EC',
  V_VAR = 'V_VAR',
  V_VA = 'V_VA',
  V_POWER_FACTOR = 'V_POWER_FACTOR',
}

export enum InternalTypes {
  I_BATTERY_LEVEL = 'I_BATTERY_LEVEL',
  I_TIME = 'I_TIME',
  I_VERSION = 'I_VERSION',
  I_ID_REQUEST = 'I_ID_REQUEST',
  I_ID_RESPONSE = 'I_ID_RESPONSE',
  I_INCLUSION_MODE = 'I_INCLUSION_MODE',
  I_CONFIG = 'I_CONFIG',
  I_FIND_PARENT = 'I_FIND_PARENT',
  I_FIND_PARENT_RESPONSE = 'I_FIND_PARENT_RESPONSE',
  I_LOG_MESSAGE = 'I_LOG_MESSAGE',
  I_CHILDREN = 'I_CHILDREN',
  I_SKETCH_NAME = 'I_SKETCH_NAME',
  I_SKETCH_VERSION = 'I_SKETCH_VERSION',
  I_REBOOT = 'I_REBOOT',
  I_GATEWAY_READY = 'I_GATEWAY_READY',
  I_SIGNING_PRESENTATION = 'I_SIGNING_PRESENTATION',
  I_NONCE_REQUEST = 'I_NONCE_REQUEST',
  I_NONCE_RESPONSE = 'I_NONCE_RESPONSE',
  I_HEARTBEAT_REQUEST = 'I_HEARTBEAT_REQUEST',
  I_PRESENTATION = 'I_PRESENTATION',
  I_DISCOVER_REQUEST = 'I_DISCOVER_REQUEST',
  I_DISCOVER_RESPONSE = 'I_DISCOVER_RESPONSE',
  I_HEARTBEAT_RESPONSE = 'I_HEARTBEAT_RESPONSE',
  I_LOCKED = 'I_LOCKED',
  I_PING = 'I_PING',
  I_PONG = 'I_PONG',
  I_REGISTRATION_REQUEST = 'I_REGISTRATION_REQUEST',
  I_REGISTRATION_RESPONSE = 'I_REGISTRATION_RESPONSE',
  I_DEBUG = 'I_DEBUG',
  I_SIGNAL_REPORT_REQUEST = 'I_SIGNAL_REPORT_REQUEST',
  I_SIGNAL_REPORT_REVERSE = 'I_SIGNAL_REPORT_REVERSE',
  I_SIGNAL_REPORT_RESPONSE = 'I_SIGNAL_REPORT_RESPONSE',
  I_PRE_SLEEP_NOTIFICATION = 'I_PRE_SLEEP_NOTIFICATION',
  I_POST_SLEEP_NOTIFICATION = 'I_POST_SLEEP_NOTIFICATION',
}

export enum Units {
  '°C' = '°C',
  '%' = '%',
  Pa = 'Pa',
  mm = 'mm',
  m = 'm',
  'mm/d' = 'mm/d',
  'kg' = 'kg',
  W = 'W',
  kWh = 'kWh',
  mV = 'mV',
  V = 'V',
  'ms/cm' = 'ms/cm',
  VA = 'VA',
}

export enum Commands {
  presentation = 'presentation',
  set = 'set',
  req = 'req',
  internal = 'internal',
  stream = 'stream',
}

export type CommandsAsInteger = `${Methods}`;

export enum Methods {
  'presentation',
  'set',
  'req',
  'internal',
  'stream',
}

export type Ack = 0 | 1;

export enum Directions {
  in = 'in',
  out = 'out',
}

export type Type = `${SensorTypes | InternalTypes | VariableTypes}`;

export type Payload = string | number;

// MQTT Pattern

export const MySensorsMqttPattern =
  '+gatewayAndDirection/+nodeId/+childId/+method/+ack/+type';

export type MySensorsMqttPattern =
  `${string}-${Directions}/${number}/${number}/${CommandsAsInteger}/${Ack}/${Type}`;

// Serial Pattern

export const MySensorsSerialPattern =
  '+nodeId;+childId;+method;+ack;+type;+payload';

export type MySensorsSerialPattern =
  `${number};${number};${CommandsAsInteger};${Ack};${Type};${Payload}`;

export enum Transport {
  SERIAL = 'serial',
  MQTT = 'mqtt',
}

export type MySensorsProtocol<
  M extends `${Commands}` = Commands,
  T extends Transport = Transport
> = {
  gatewayAndDirection: T extends Transport.MQTT
    ? `${string}-${Directions}`
    : undefined;
  nodeId: number;
  childId: number;
  method: M;
  ack: Ack;
  type: M extends 'presentation'
    ? SensorTypes
    : M extends 'internal'
    ? InternalTypes
    : M extends 'set'
    ? VariableTypes
    : M extends 'req'
    ? VariableTypes
    : Type;
  payload: Payload;
};

export enum Separator {
  MQTT = '/',
  SERIAL = ';',
}
