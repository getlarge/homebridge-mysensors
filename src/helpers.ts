import { Characteristic, Service, WithUUID } from 'homebridge';

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
