import {
  CharacteristicSetCallback,
  CharacteristicValue,
  PrimitiveTypes,
} from 'homebridge';

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
import { CharacteristicMonitor, MappingCharacteristicMonitor } from './monitor';

export class SwitchCreator implements ServiceCreator {
  createServicesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void {
    if (
      SensorTypes.S_BINARY === protocol.type &&
      !accessory.isServiceHandlerIdKnown(
        SwitchHandler.generateIdentifier(protocol.type)
      )
    ) {
      this.createService(accessory, protocol);
    }
  }

  private createService(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void {
    try {
      const handler = new SwitchHandler(
        accessory,
        protocol.type,
        presentations[protocol.type].resources,
        protocol.childId
      );
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

class SwitchHandler implements ServiceHandler {
  private monitor: CharacteristicMonitor;
  // private stateExpose: ExposesEntryWithBinaryProperty;
  identifier: string;

  constructor(
    private readonly accessory: BasicAccessory,
    readonly sensorType: SensorTypes,
    readonly resources: `${VariableTypes}`[],
    readonly childId: number
  ) {
    this.identifier = SwitchHandler.generateIdentifier(this.sensorType);
    const serviceName = accessory.getDefaultServiceDisplayName(this.sensorType);
    const service = accessory.getOrAddService(
      new hap.Service.Switch(serviceName, this.sensorType)
    );
    // const potentialStateExpose = expose.features.find(
    //   (e) =>
    //     exposesHasBinaryProperty(e) &&
    //     !accessory.isPropertyExcluded(e.property) &&
    //     e.name === 'state' &&
    //     exposesCanBeSet(e) &&
    //     exposesIsPublished(e)
    // ) as ExposesEntryWithBinaryProperty;
    // if (potentialStateExpose === undefined) {
    //   throw new Error('Required "state" property not found for Switch.');
    // }

    accessory.log.debug(`Configuring Switch for ${serviceName}`);
    getOrAddCharacteristic(service, hap.Characteristic.On).on(
      'set',
      this.handleSetOn.bind(this)
    );
    const onOffValues = new Map<PrimitiveTypes, PrimitiveTypes>();
    onOffValues.set('1', true);
    onOffValues.set('0', false);
    this.monitor = new MappingCharacteristicMonitor(
      VariableTypes.V_STATUS,
      service,
      hap.Characteristic.On,
      onOffValues
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
    this.monitor.callback(state);
  }

  private handleSetOn(
    value: CharacteristicValue,
    callback: CharacteristicSetCallback
  ): void {
    const data = (value as boolean) ? '1' : '0';
    this.accessory.queueDataForSetAction([
      {
        childId: this.childId,
        resource: VariableTypes.V_STATUS,
        data,
      },
    ]);
    callback(null);
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.Switch.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}
