import { Characteristic, Service, WithUUID } from 'homebridge';

import { SUPPORTED_PRESENTATION_TYPES } from './converter/contants';
import { Commands, MySensorsProtocol } from './mySensors/protocol';

export function errorToString(e: unknown): string {
  if (typeof e === 'string') {
    return e;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return JSON.stringify(e);
}

export function getOrAddCharacteristic(
  service: Service,
  characteristic: WithUUID<{ new (): Characteristic }>
): Characteristic {
  return (
    service.getCharacteristic(characteristic) ||
    service.addCharacteristic(characteristic)
  );
}

export function roundToDecimalPlaces(
  input: number,
  decimalPlaces: number
): number {
  if (
    decimalPlaces !== Math.round(decimalPlaces) ||
    decimalPlaces < 1 ||
    decimalPlaces > 10
  ) {
    throw new Error(
      `decimalPlaces must be a whole number between 1 and 10, not ${decimalPlaces}`
    );
  }
  const maxDecimals = Math.pow(10, decimalPlaces);
  return Math.round((input + Number.EPSILON) * maxDecimals) / maxDecimals;
}

export function isSupportedDevice(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol: MySensorsProtocol<Commands.presentation>
): boolean {
  return SUPPORTED_PRESENTATION_TYPES.includes(protocol.type);
}
