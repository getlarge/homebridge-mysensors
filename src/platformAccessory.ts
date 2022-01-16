import { PlatformAccessory, Service } from 'homebridge';
import { QoS } from 'mqtt';

import {
  BasicServiceCreatorManager,
  ServiceCreatorManager,
} from './converter/creators';
import {
  BasicAccessory,
  BasicLogger,
  MySensorsContext,
  ServiceHandler,
} from './converter/interfaces';
import { hap } from './hap';
import { isMySensorsProtocol, protocolsAreEquals } from './mySensors/helpers';
import {
  Commands,
  Directions,
  Methods,
  MySensorsMqttPattern,
  MySensorsProtocol,
  MySensorsSerialPattern,
  Separator,
  Transport,
  VariableTypes,
} from './mySensors/protocol';
import { MySensorsPlatform } from './platform';
import { ExtendedTimer } from './timer';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class MySensorsAccessory implements BasicAccessory {
  private readonly updateTimer: ExtendedTimer;
  private readonly serviceCreatorManager: ServiceCreatorManager;
  private readonly serviceHandlers = new Map<string, ServiceHandler>();
  private readonly serviceIds = new Set<string>();

  // map containing childIds => resources => values
  private pendingPublishData: Map<number, Map<`${VariableTypes}`, string[]>>;
  private publishIsScheduled: boolean;
  // map containing childIds => resources
  private readonly pendingGetKeys: Map<number, Set<`${VariableTypes}`>>;
  private getIsScheduled: boolean;

  static getDisplayName<T extends Transport>(
    protocol: MySensorsProtocol<Commands, T>,
    transport: T
  ): string {
    const { nodeId } = protocol;
    return `MySensors-${nodeId}-${transport.toUpperCase()}`;
  }

  static getUniqueIdForService(service: Service): string {
    if (service.subtype === undefined) {
      return service.UUID;
    }
    return `${service.UUID}_${service.subtype}`;
  }

  get UUID(): string {
    return this.accessory.UUID;
  }

  get serialNumber(): string {
    // TODO: define where to retrieve serial number
    return 'Default-Serial';
  }

  get log(): BasicLogger {
    return this.platform.log;
  }

  get nodeId(): number {
    return this.accessory.context.protocol.nodeId;
  }

  get transport(): Transport {
    return this.accessory.context.transport;
  }

  get context(): MySensorsContext<Commands> {
    return this.accessory.context;
  }

  get displayName(): string {
    return MySensorsAccessory.getDisplayName(
      this.accessory.context.protocol,
      this.transport
    );
  }

  get deviceTopic(): `${string}-${Directions}/${number}` | `${number}` {
    const { gatewayAndDirection, nodeId } = this.accessory.context
      .protocol as MySensorsProtocol<Commands>;

    if (this.transport === Transport.MQTT) {
      return `${gatewayAndDirection as `${string}-${Directions}`}/${nodeId}`;
    }
    return `${nodeId}`;
  }

  constructor(
    private readonly platform: MySensorsPlatform,
    public readonly accessory: PlatformAccessory<MySensorsContext>,
    serviceCreatorManager?: ServiceCreatorManager
  ) {
    // Store ServiceCreatorManager
    if (serviceCreatorManager === undefined) {
      this.serviceCreatorManager = BasicServiceCreatorManager.getInstance();
    } else {
      this.serviceCreatorManager = serviceCreatorManager;
    }

    // Setup delayed publishing
    this.pendingPublishData = new Map();
    this.publishIsScheduled = false;

    // Setup delayed get
    this.pendingGetKeys = new Map();
    this.getIsScheduled = false;

    this.updateDeviceInformation(accessory.context.protocol, true);

    // Ask MySensors device for a status update at least once every 4 hours.
    this.updateTimer = new ExtendedTimer(() => {
      this.queueAllKeysForGet();
    }, 4 * 60 * 60 * 1000);

    // Immediately request an update to start off.
    this.queueAllKeysForGet();

    // set default accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Default-Manufacturer'
      )
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        'Default-Serial'
      );
  }

  registerServiceHandler(handler: ServiceHandler): void {
    const key = handler.identifier;
    if (this.serviceHandlers.has(key)) {
      this.log.error(
        `DUPLICATE SERVICE HANDLER with identifier ${key} for accessory ${this.displayName}. New one will not stored.`
      );
    } else {
      this.serviceHandlers.set(key, handler);
    }
  }

  isServiceHandlerIdKnown(identifier: VariableTypes): boolean {
    return this.serviceHandlers.has(identifier);
  }

  private publishPendingGetKeys(): void {
    for (const [childId, resources] of this.pendingGetKeys.entries()) {
      const keys = [...resources];
      this.getIsScheduled = false;
      if (keys.length > 0) {
        for (const k of keys) {
          const separator =
            this.transport === Transport.MQTT
              ? Separator.MQTT
              : Separator.SERIAL;
          const topic = [this.deviceTopic, childId, Methods.req, 0, k].join(
            separator
          ) as MySensorsSerialPattern | MySensorsMqttPattern;

          this.platform.publishMessage(this.transport, topic, '1', {
            qos: this.getMqttQosLevel(1),
          });
          //? wait for message to be  published before deleting ?
          this.pendingGetKeys.get(childId)!.delete(k);
        }
      }
      // this.pendingGetKeys.delete(childId);
    }
  }

  queueKeyForGetAction(
    children: {
      childId: number;
      resources: `${VariableTypes}` | `${VariableTypes}`[];
    }[]
  ): void {
    for (const { childId, resources } of children) {
      if (!this.pendingGetKeys.has(childId)) {
        this.pendingGetKeys.set(childId, new Set());
      }
      if (Array.isArray(resources)) {
        for (const k of resources) {
          this.pendingGetKeys.get(childId)!.add(k);
        }
      } else {
        this.pendingGetKeys.get(childId)!.add(resources);
      }
    }

    this.log.debug(
      `Pending get: ${[...this.pendingGetKeys.keys()].join(', ')}`
    );

    if (!this.getIsScheduled) {
      this.getIsScheduled = true;
      process.nextTick(() => {
        this.publishPendingGetKeys();
      });
    }
  }

  private queueAllKeysForGet(): void {
    const children = [...this.serviceHandlers.values()].flatMap((h) => ({
      childId: h.childId,
      resources: h.getableKeys,
    }));

    this.log.debug(`queueAllKeysForGet ${JSON.stringify(children, null, 2)}`);
    if (children.length > 0) {
      this.queueKeyForGetAction(children);
    }
  }

  private publishPendingSetData() {
    for (const [childId, resources] of this.pendingPublishData.entries()) {
      const separator =
        this.transport === Transport.MQTT ? Separator.MQTT : Separator.SERIAL;

      for (const [resource, values] of resources.entries()) {
        const topic = [
          this.deviceTopic,
          childId,
          Methods.req,
          0,
          resource,
        ].join(separator) as MySensorsSerialPattern | MySensorsMqttPattern;
        for (const value of values) {
          this.platform.publishMessage(this.transport, topic, value, {
            qos: this.getMqttQosLevel(2),
          });
        }
        //? wait for message to be published before deleting ?
        this.pendingPublishData.get(childId)!.delete(resource);
      }
    }

    this.publishIsScheduled = false;
    this.pendingPublishData = new Map();
  }

  queueDataForSetAction(
    children: {
      childId: number;
      resource: VariableTypes;
      data: string;
    }[]
  ): void {
    for (const { childId, resource, data } of children) {
      if (!this.pendingPublishData.has(childId)) {
        const resources = new Map();
        resources.set(resource, []);
        this.pendingPublishData.set(childId, resources);
      }
      if (!this.pendingPublishData.get(childId)!.has(resource)) {
        this.pendingPublishData.get(childId)!.set(resource, []);
      }
      this.pendingPublishData.get(childId)!.get(resource)!.push(data);
    }
    this.log.debug(
      `Pending data: ${JSON.stringify(this.pendingPublishData.keys())}`
    );

    if (!this.publishIsScheduled) {
      this.publishIsScheduled = true;
      process.nextTick(() => {
        this.publishPendingSetData();
      });
    }
  }

  getOrAddService(service: Service): Service {
    this.serviceIds.add(MySensorsAccessory.getUniqueIdForService(service));
    const existingService = this.accessory.services.find(
      (e) => e.UUID === service.UUID && e.subtype === service.subtype
    );

    if (existingService !== undefined) {
      return existingService;
    }
    return this.accessory.addService(service);
  }

  matchesIdentifier(
    protocol: MySensorsProtocol,
    transport: Transport
  ): boolean {
    return (
      MySensorsAccessory.getDisplayName(protocol, transport) ===
      this.displayName
    );
  }

  updateDeviceInformation(protocol: MySensorsProtocol, forceUpdate = false) {
    // Only update the device if a valid device list entry is passed.
    if (
      isMySensorsProtocol(protocol) &&
      (forceUpdate ||
        !protocolsAreEquals(this.accessory.context.protocol, protocol))
    ) {
      const newFriendlyName = MySensorsAccessory.getDisplayName(
        protocol,
        this.transport
      );
      const friendlyNameChanged =
        forceUpdate || newFriendlyName.localeCompare(this.displayName) !== 0;
      // Device info has changed
      this.accessory.context.protocol = protocol;
      // TODO: check protocol method and type to update services

      // Update accessory info
      // Note: getOrAddService is used so that the service is known in this.serviceIds and will not get filtered out.
      this.getOrAddService(new hap.Service.AccessoryInformation())
        .updateCharacteristic(hap.Characteristic.Name, newFriendlyName)
        .updateCharacteristic(hap.Characteristic.Manufacturer, 'MySensors')
        .updateCharacteristic(hap.Characteristic.Model, 'unknown')
        .updateCharacteristic(
          hap.Characteristic.SerialNumber,
          this.serialNumber
        )
        .updateCharacteristic(hap.Characteristic.HardwareRevision, '?')
        // TODO: get from presentation message
        .updateCharacteristic(hap.Characteristic.FirmwareRevision, '?');

      // Create (new) services if message is of type presention
      if (protocol.method === Commands.presentation) {
        this.serviceCreatorManager.createHomeKitEntitiesFromPresentation(
          this,
          protocol as MySensorsProtocol<Commands.presentation>
        );
      }
      this.cleanStaleServices();
      if (friendlyNameChanged) {
        this.platform.log.debug(
          `Updating service names for ${newFriendlyName} (from ${this.displayName})`
        );
        this.updateServiceNames();
      }
    }
    this.platform.api.updatePlatformAccessories([this.accessory]);
  }

  private updateServiceNames(): void {
    // Update the name of all services
    for (const service of this.accessory.services) {
      if (service.UUID === hap.Service.AccessoryInformation.UUID) {
        continue;
      }
      const nameCharacteristic = service.getCharacteristic(
        hap.Characteristic.Name
      );
      if (nameCharacteristic !== undefined) {
        const displayName = this.getDefaultServiceDisplayName(service.subtype);
        nameCharacteristic.updateValue(displayName);
      }
    }
  }

  updateState(state: MySensorsProtocol<Commands.set>) {
    // Restart timer
    this.updateTimer.restart();

    // Call updates
    for (const handler of this.serviceHandlers.values()) {
      if (handler.childId === state.childId) {
        handler.updateState(state);
      }
    }
  }

  private cleanStaleServices(): void {
    // Remove all services of which identifier is not known
    const staleServices = this.accessory.services.filter(
      (s) => !this.serviceIds.has(MySensorsAccessory.getUniqueIdForService(s))
    );
    staleServices.forEach((s) => {
      this.log.debug(
        `Clean up stale service ${s.displayName} (${s.UUID}) for accessory ${this.displayName} (${this.nodeId}).`
      );
      this.accessory.removeService(s);
    });
  }

  private getMqttQosLevel(defaultQoS: QoS): QoS {
    if (this.platform.pluginConfig?.mqtt?.disableQos) {
      return 0;
    }
    return defaultQoS;
  }

  getDefaultServiceDisplayName(subType: string | undefined): string {
    let name = this.displayName;
    if (subType !== undefined) {
      name += ` ${subType}`;
    }
    return name;
  }
}
