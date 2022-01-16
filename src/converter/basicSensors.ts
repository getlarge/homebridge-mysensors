import { Service } from 'homebridge';

import { hap } from '../hap';
import { getOrAddCharacteristic } from '../helpers';
import { resourcesCanBeGet } from '../mySensors/helpers';
import { presentations } from '../mySensors/presentations';
import {
  Commands,
  MySensorsProtocol,
  SensorTypes,
  VariableTypes,
} from '../mySensors/protocol';
import { BasicAccessory, ServiceCreator, ServiceHandler } from './interfaces';
import {
  CharacteristicMonitor,
  PassthroughCharacteristicMonitor,
} from './monitor';

interface ExposeToHandlerFunction {
  (protocol: MySensorsProtocol<Commands.presentation>): ServiceHandler;
}

interface ServiceConstructor {
  (serviceName: string, subType: string | undefined): Service;
}

interface IdentifierGenerator {
  (endpoint: SensorTypes | undefined): string;
}

interface BasicSensorConstructor {
  new (
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: VariableTypes[],
    accessory: BasicAccessory
  );
}

declare type WithIdGenerator<T> = T & {
  generateIdentifier: IdentifierGenerator;
};

class BasicSensorMapping {
  public readonly resources: `${VariableTypes}`[];

  constructor(
    public readonly type: SensorTypes,
    public readonly implementation: WithIdGenerator<BasicSensorConstructor>
  ) {
    this.resources = presentations[this.type].resources;
  }
}

abstract class BasicSensorHandler implements ServiceHandler {
  protected monitors: CharacteristicMonitor[] = [];
  protected service: Service;
  protected serviceName: string;
  identifier: string;

  constructor(
    accessory: BasicAccessory,
    readonly sensorType: SensorTypes,
    readonly resources: `${VariableTypes}`[],
    readonly childId: number,
    identifierGen: IdentifierGenerator,
    service: ServiceConstructor
  ) {
    this.serviceName = accessory.getDefaultServiceDisplayName(this.sensorType);
    this.identifier = identifierGen(sensorType);
    this.service = accessory.getOrAddService(
      service(this.serviceName, this.sensorType)
    );
  }

  get getableKeys(): `${VariableTypes}`[] {
    const keys: `${VariableTypes}`[] = [];
    if (resourcesCanBeGet(this.resources)) {
      keys.concat(this.resources);
    }
    return keys;
  }

  updateState(state: MySensorsProtocol<Commands.set>): void {
    this.monitors.forEach((m) => m.callback(state));
  }
}

class HumiditySensorHandler extends BasicSensorHandler {
  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: typeof presentations[`${SensorTypes.S_HUM}`]['resources'],
    accessory: BasicAccessory
  ) {
    super(
      accessory,
      protocol.type,
      resources,
      protocol.childId,
      HumiditySensorHandler.generateIdentifier,
      (n, t) => new hap.Service.HumiditySensor(n, t)
    );
    accessory.log.debug(`Configuring HumiditySensor for ${this.serviceName}`);

    const characteristic = getOrAddCharacteristic(
      this.service,
      hap.Characteristic.CurrentRelativeHumidity
    );
    characteristic.setProps({
      minValue: 0,
      maxValue: 100,
    });
    this.monitors.push(
      new PassthroughCharacteristicMonitor(
        VariableTypes.V_HUM,
        this.service,
        hap.Characteristic.CurrentRelativeHumidity
      )
    );
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.HumiditySensor.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}

class TemperatureSensorHandler extends BasicSensorHandler {
  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: typeof presentations[`${SensorTypes.S_TEMP}`]['resources'],
    accessory: BasicAccessory
  ) {
    super(
      accessory,
      protocol.type,
      resources,
      protocol.childId,
      TemperatureSensorHandler.generateIdentifier,
      (n, t) => new hap.Service.TemperatureSensor(n, t)
    );
    accessory.log.debug(
      `Configuring TemperatureSensor for ${this.serviceName}`
    );
    const characteristic = getOrAddCharacteristic(
      this.service,
      hap.Characteristic.CurrentTemperature
    );
    characteristic.setProps({
      minValue: -100,
      maxValue: 100,
    });

    this.monitors.push(
      new PassthroughCharacteristicMonitor(
        VariableTypes.V_TEMP,
        this.service,
        hap.Characteristic.CurrentTemperature
      )
    );
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.TemperatureSensor.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}

class LightSensorHandler extends BasicSensorHandler {
  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: typeof presentations[`${SensorTypes.S_LIGHT_LEVEL}`]['resources'],
    accessory: BasicAccessory
  ) {
    super(
      accessory,
      protocol.type,
      resources,
      protocol.childId,
      LightSensorHandler.generateIdentifier,
      (n, t) => new hap.Service.LightSensor(n, t)
    );
    accessory.log.debug(`Configuring LightSensor for ${this.serviceName}`);

    const characteristic = getOrAddCharacteristic(
      this.service,
      hap.Characteristic.CurrentAmbientLightLevel
    );
    characteristic.setProps({
      minValue: 0,
    });

    this.monitors.push(
      new PassthroughCharacteristicMonitor(
        VariableTypes.V_LIGHT_LEVEL,
        this.service,
        hap.Characteristic.CurrentAmbientLightLevel
      )
    );
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.LightSensor.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}

export class BasicSensorCreator implements ServiceCreator {
  private static mapping: BasicSensorMapping[] = [
    new BasicSensorMapping(SensorTypes.S_HUM, HumiditySensorHandler),
    new BasicSensorMapping(SensorTypes.S_TEMP, TemperatureSensorHandler),
    new BasicSensorMapping(SensorTypes.S_LIGHT_LEVEL, LightSensorHandler),
  ];

  createServicesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void {
    BasicSensorCreator.mapping.forEach((m) => {
      // only create service for a given protocol.type and if it does not already exist
      if (
        m.type === protocol.type &&
        !accessory.isServiceHandlerIdKnown(
          m.implementation.generateIdentifier(protocol.type)
        )
      ) {
        this.createService(
          accessory,
          protocol,
          (x) =>
            new m.implementation(x, m.resources as VariableTypes[], accessory)
        );
      }
    });
  }

  private createService(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>,
    creator: ExposeToHandlerFunction
  ): void {
    try {
      const handler = creator(protocol);
      accessory.registerServiceHandler(handler);
    } catch (error) {
      accessory.log.warn(
        `Failed to setup sensor for accessory ${
          accessory.displayName
        } from protocol "${JSON.stringify(protocol)}": ${error}`
      );
    }
  }
}
