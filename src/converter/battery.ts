import { hap } from '../hap';
import { getOrAddCharacteristic } from '../helpers';
import { resourcesCanBeGet } from '../mySensors/helpers';
import { presentations } from '../mySensors/presentations';
import {
  Commands,
  MySensorsProtocol,
  SensorTypes,
  Transport,
  VariableTypes,
} from '../mySensors/protocol';
import { BasicAccessory, ServiceCreator, ServiceHandler } from './interfaces';
import {
  BinaryConditionCharacteristicMonitor,
  CharacteristicMonitor,
  NumericCharacteristicMonitor,
} from './monitor';

export class BatteryCreator implements ServiceCreator {
  createServicesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation, Transport>
  ): void {
    // TODO: filter out "real" multimeter using protocol.payload ?
    if (
      SensorTypes.S_MULTIMETER === protocol.type &&
      !accessory.isServiceHandlerIdKnown(
        BatteryHandler.generateIdentifier(protocol.type)
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
      const handler = new BatteryHandler(
        accessory,
        protocol.type,
        presentations[protocol.type].resources,
        protocol.childId
      );
      accessory.registerServiceHandler(handler);
    } catch (error) {
      accessory.log.warn(
        'Failed to setup battery service ' +
          `for accessory ${accessory.displayName} for ${protocol.type}: ${error}`
      );
    }
  }
}

class BatteryHandler implements ServiceHandler {
  private monitors: CharacteristicMonitor[] = [];
  private maxVoltage = 3.4;
  private minVoltage = 2.4;
  identifier: string;

  // TODO: make max and min values dynamic ?
  constructor(
    private readonly accessory: BasicAccessory,
    readonly sensorType: SensorTypes,
    readonly resources: `${VariableTypes}`[],
    readonly childId: number
  ) {
    this.identifier = BatteryHandler.generateIdentifier(sensorType);

    const serviceName = accessory.getDefaultServiceDisplayName(sensorType);
    accessory.log.debug(`Configuring Battery Service for ${serviceName}`);
    const service = accessory.getOrAddService(
      new hap.Service.Battery(serviceName, sensorType)
    );
    getOrAddCharacteristic(service, hap.Characteristic.BatteryLevel);
    getOrAddCharacteristic(service, hap.Characteristic.StatusLowBattery);
    getOrAddCharacteristic(service, hap.Characteristic.ChargingState);

    // Note: no defined exposes name for the charge state, so assuming batteries are non-chargeable.
    service.updateCharacteristic(
      hap.Characteristic.ChargingState,
      hap.Characteristic.ChargingState.NOT_CHARGEABLE
    );

    this.monitors.push(
      new NumericCharacteristicMonitor(
        VariableTypes.V_VOLTAGE,
        service,
        hap.Characteristic.BatteryLevel,
        0,
        100
      )
    );

    this.monitors.push(
      new BinaryConditionCharacteristicMonitor(
        VariableTypes.V_STATUS,
        service,
        hap.Characteristic.StatusLowBattery,
        (v) => (v as number) < 100 / (this.maxVoltage / this.minVoltage),
        hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW,
        hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
      )
    );
  }

  get getableKeys(): `${VariableTypes}`[] {
    const keys: `${VariableTypes}`[] = [];
    if (resourcesCanBeGet([`${VariableTypes.V_VOLTAGE}`])) {
      keys.push(VariableTypes.V_VOLTAGE);
    }
    return keys;
  }

  updateState(state: MySensorsProtocol<Commands.set>): void {
    const val = Number(state.payload);
    state.payload = (val * 100) / this.maxVoltage;
    this.monitors.forEach((m) => m.callback(state));
  }

  static generateIdentifier(endpoint: string | undefined) {
    let identifier = hap.Service.Battery.UUID;
    if (endpoint !== undefined) {
      identifier += '_' + endpoint.trim();
    }
    return identifier;
  }
}
