import { Characteristic, PrimitiveTypes, Service, WithUUID } from 'homebridge';

import {
  Commands,
  MySensorsProtocol,
  VariableTypes,
} from '../mySensors/protocol';

export interface MqttToHomeKitValueTransformer {
  (value: unknown): PrimitiveTypes | undefined;
}

export interface CharacteristicMonitor {
  callback(state: Record<string, unknown>): void;
}

abstract class BaseCharacteristicMonitor implements CharacteristicMonitor {
  constructor(
    private readonly key: VariableTypes,
    protected readonly service: Service,
    protected readonly characteristic:
      | string
      | WithUUID<new () => Characteristic>
  ) {}

  abstract transformValueFromMqtt(value: unknown): PrimitiveTypes | undefined;

  callback(state: MySensorsProtocol<Commands.set>): void {
    if (this.key === state.type) {
      const value = state.payload;
      // value = this.transformValueFromMqtt(value);
      if (value !== undefined) {
        this.service.updateCharacteristic(
          this.characteristic,
          value as PrimitiveTypes
        );
      }
    }
  }
}

export class PassthroughCharacteristicMonitor extends BaseCharacteristicMonitor {
  constructor(
    key: VariableTypes,
    service: Service,
    characteristic: string | WithUUID<new () => Characteristic>
  ) {
    super(key, service, characteristic);
  }

  transformValueFromMqtt(value: unknown): PrimitiveTypes | undefined {
    return value as PrimitiveTypes;
  }
}
