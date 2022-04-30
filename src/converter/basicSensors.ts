import { Characteristic, PrimitiveTypes, Service, WithUUID } from 'homebridge';

import { hap } from '../hap';
import { getOrAddCharacteristic } from '../helpers';
import { getEndpoint, resourcesCanBeGet } from '../mySensors/helpers';
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
  MappingCharacteristicMonitor,
  PassthroughCharacteristicMonitor,
} from './monitor';

interface ExposeToHandlerFunction {
  (protocol: MySensorsProtocol<Commands.presentation>): ServiceHandler;
}

interface ServiceConstructor {
  (serviceName: string, subType: string | undefined): Service;
}

interface IdentifierGenerator {
  (endpoint: string | undefined): string;
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
    this.identifier = identifierGen(
      getEndpoint(accessory.nodeId, this.childId, this.sensorType)
    );
    this.serviceName = accessory.getDefaultServiceDisplayName(this.sensorType);
    this.service = accessory.getOrAddService(
      service(this.serviceName, this.sensorType)
    );
  }

  get getableKeys(): `${VariableTypes}`[] {
    const keys: `${VariableTypes}`[] = [];
    if (resourcesCanBeGet(this.resources)) {
      return keys.concat(this.resources);
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

class AirPressureSensorHandler extends BasicSensorHandler {
  private static readonly ServiceUUID: string =
    'E863F00A-079E-48FF-8F27-9C2605A29F52';

  private static readonly CharacteristicUUID: string =
    'E863F10F-079E-48FF-8F27-9C2605A29F52';

  private static readonly CharacteristicName: string = 'Air Pressure';

  static AirPressureSensor(
    displayName: string,
    subtype?: string | undefined
  ): Service {
    const service = new hap.Service(
      displayName,
      AirPressureSensorHandler.ServiceUUID,
      subtype
    );
    service.addCharacteristic(AirPressureSensorHandler.AirPressure);
    return service;
  }

  static get AirPressure(): Characteristic {
    const characteristic = new hap.Characteristic(
      AirPressureSensorHandler.CharacteristicName,
      AirPressureSensorHandler.CharacteristicUUID,
      {
        format: hap.Formats.UINT16,
        perms: [hap.Perms.PAIRED_READ, hap.Perms.NOTIFY],
        minValue: 700,
        maxValue: 1100,
        minStep: 1,
      }
    );
    characteristic.value = 1013;
    return characteristic;
  }

  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: typeof presentations[`${SensorTypes.S_BARO}`]['resources'],
    accessory: BasicAccessory
  ) {
    super(
      accessory,
      protocol.type,
      resources,
      protocol.childId,
      AirPressureSensorHandler.generateIdentifier,
      (n, t) => AirPressureSensorHandler.AirPressureSensor(n, t)
    );
    accessory.log.debug(
      `Configuring AirPressureSensor for ${this.serviceName}`
    );

    this.monitors.push(
      new PassthroughCharacteristicMonitor(
        VariableTypes.V_PRESSURE,
        this.service,
        AirPressureSensorHandler.CharacteristicName
      )
    );
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = AirPressureSensorHandler.ServiceUUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}

abstract class BinarySensorHandler extends BasicSensorHandler {
  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: `${VariableTypes}`[],
    accessory: BasicAccessory,
    identifierGen: IdentifierGenerator,
    logName: string,
    service: ServiceConstructor,
    characteristic: WithUUID<{ new (): Characteristic }>,
    hapOnValue: PrimitiveTypes,
    hapOffValue: PrimitiveTypes,
    resource:
      | VariableTypes.V_TRIPPED
      | VariableTypes.V_ARMED = VariableTypes.V_TRIPPED
  ) {
    super(
      accessory,
      protocol.type,
      resources,
      protocol.childId,
      identifierGen,
      service
    );
    accessory.log.debug(`Configuring ${logName} for ${this.serviceName}`);

    getOrAddCharacteristic(this.service, characteristic);
    const mapping = new Map<PrimitiveTypes, PrimitiveTypes>();
    mapping.set('1', hapOnValue);
    mapping.set('0', hapOffValue);
    this.monitors.push(
      new MappingCharacteristicMonitor(
        resource,
        this.service,
        characteristic,
        mapping
      )
    );
  }
}

class ContactSensorHandler extends BinarySensorHandler {
  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: typeof presentations[`${SensorTypes.S_DOOR}`]['resources'],
    accessory: BasicAccessory
  ) {
    super(
      protocol,
      resources,
      accessory,
      ContactSensorHandler.generateIdentifier,
      'ContactSensor',
      (n, t) => new hap.Service.ContactSensor(n, t),
      hap.Characteristic.ContactSensorState,
      hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED,
      hap.Characteristic.ContactSensorState.CONTACT_DETECTED,
      VariableTypes.V_TRIPPED
    );
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.ContactSensor.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}

class OccupancySensorHandler extends BinarySensorHandler {
  constructor(
    protocol: MySensorsProtocol<Commands.presentation>,
    resources: typeof presentations[`${SensorTypes.S_MOTION}`]['resources'],
    accessory: BasicAccessory
  ) {
    super(
      protocol,
      resources,
      accessory,
      OccupancySensorHandler.generateIdentifier,
      'OccupancySensor',
      (n, t) => new hap.Service.OccupancySensor(n, t),
      hap.Characteristic.OccupancyDetected,
      hap.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED,
      hap.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED,
      VariableTypes.V_TRIPPED
    );
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.OccupancySensor.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}

export class BasicSensorCreator implements ServiceCreator {
  private static sensorTypes = {
    [SensorTypes.S_HUM]: HumiditySensorHandler,
    [SensorTypes.S_TEMP]: TemperatureSensorHandler,
    [SensorTypes.S_LIGHT_LEVEL]: LightSensorHandler,
    [SensorTypes.S_BARO]: AirPressureSensorHandler,
    [SensorTypes.S_DOOR]: ContactSensorHandler,
    [SensorTypes.S_MOTION]: OccupancySensorHandler,
  };

  private static mapping: BasicSensorMapping[] = Object.entries(
    this.sensorTypes
  ).map(
    ([sensorType, impl]) =>
      new BasicSensorMapping(sensorType as SensorTypes, impl)
  );

  createServicesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void {
    BasicSensorCreator.mapping.forEach((m) => {
      // only create service for a given protocol.type and if it does not already exist
      const isServiceHandlerIdKnown = accessory.isServiceHandlerIdKnown(
        m.implementation.generateIdentifier(
          getEndpoint(accessory.nodeId, protocol.childId, protocol.type)
        )
      );
      if (m.type === protocol.type && !isServiceHandlerIdKnown) {
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
