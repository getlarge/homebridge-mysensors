import {
  Characteristic,
  CharacteristicValue,
  PrimitiveTypes,
  Service,
  WithUUID,
} from 'homebridge';

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

export class MappingCharacteristicMonitor extends BaseCharacteristicMonitor {
  constructor(
    key: VariableTypes,
    service: Service,
    characteristic: string | WithUUID<new () => Characteristic>,
    private readonly mapping: Map<CharacteristicValue, PrimitiveTypes>
  ) {
    super(key, service, characteristic);
    if (mapping.size === 0) {
      throw new RangeError(
        `Empty mapping passed to MappingCharacteristicMonitor for key ${key} on service ${this.service.UUID}.`
      );
    }
  }

  transformValueFromMqtt(value: unknown): PrimitiveTypes | undefined {
    return this.mapping.get(value as CharacteristicValue);
  }
}

export interface BinaryConditionBasedOnValue {
  (value: unknown): boolean;
}

export class BinaryConditionCharacteristicMonitor extends BaseCharacteristicMonitor {
  constructor(
    key: VariableTypes,
    service: Service,
    characteristic: string | WithUUID<new () => Characteristic>,
    private readonly condition: BinaryConditionBasedOnValue,
    private readonly value_true: PrimitiveTypes,
    private readonly value_false: PrimitiveTypes
  ) {
    super(key, service, characteristic);
  }

  transformValueFromMqtt(value: unknown): PrimitiveTypes | undefined {
    return this.condition(value) ? this.value_true : this.value_false;
  }
}

export class NumericCharacteristicMonitor extends BaseCharacteristicMonitor {
  constructor(
    key: VariableTypes,
    service: Service,
    characteristic: string | WithUUID<new () => Characteristic>,
    private readonly input_min: number,
    private readonly input_max: number,
    private readonly output_min?: number | undefined,
    private readonly output_max?: number | undefined
  ) {
    super(key, service, characteristic);
    if (input_min === input_max) {
      throw new RangeError(
        `input min/max equal on NumericCharacteristicMonitor for key ${key} on service ${this.service.UUID}.`
      );
    }
    if (output_min !== undefined && output_min === output_max) {
      throw new RangeError(
        `output min/max equal on NumericCharacteristicMonitor for key ${key} on service ${this.service.UUID}.`
      );
    }
  }

  transformValueFromMqtt(value: unknown): PrimitiveTypes | undefined {
    const input = value as number;
    let out_minimum: number;
    let out_maximum: number;

    const actualCharacteristic = this.service.getCharacteristic(
      this.characteristic
    );
    if (this.output_min === undefined) {
      if (
        actualCharacteristic === undefined ||
        actualCharacteristic.props.minValue === undefined
      ) {
        throw new Error(
          'NumericCharacteristicMonitor initialized without output_min, but it is not provided by characteristic either.'
        );
      }
      out_minimum = actualCharacteristic.props.minValue;
    } else {
      out_minimum = this.output_min;
    }

    if (this.output_max === undefined) {
      if (
        actualCharacteristic === undefined ||
        actualCharacteristic.props.maxValue === undefined
      ) {
        throw new Error(
          'NumericCharacteristicMonitor initialized without output_max, but it is not provided by characteristic either.'
        );
      }
      out_maximum = actualCharacteristic.props.maxValue;
    } else {
      out_maximum = this.output_max;
    }

    if (input <= this.input_min) {
      return out_minimum;
    }
    if (input >= this.input_max) {
      return out_maximum;
    }
    const percentage =
      (input - this.input_min) / (this.input_max - this.input_min);

    return out_minimum + percentage * (out_maximum - out_minimum);
  }
}
