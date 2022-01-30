import {
  API,
  APIEvent,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
} from 'homebridge';
import { IClientPublishOptions } from 'mqtt';

import { isPluginConfiguration, PluginConfiguration } from './configModels';
import { MySensorsContext } from './converter/interfaces';
import { errorToString } from './helpers';
import {
  Commands,
  MySensorsMqttPattern,
  MySensorsProtocol,
  MySensorsSerialPattern,
  Transport,
} from './mySensors/protocol';
import { MySensorsAccessory } from './platformAccessory';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { MySensorsMqttTransport, MySensorsSerialTransport } from './transport';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class MySensorsPlatform implements DynamicPlatformPlugin {
  public readonly Service = this.api.hap.Service;
  public readonly Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  private readonly accessories: MySensorsAccessory[] = [];
  public readonly pluginConfig?: PluginConfiguration;
  private readonly mqttTransport?: MySensorsMqttTransport;
  private readonly serialTransport?: MySensorsSerialTransport;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // Validate configuration
    if (isPluginConfiguration(config, log)) {
      this.pluginConfig = config;
    } else {
      this.log.error(
        `INVALID CONFIGURATION FOR PLUGIN: ${PLUGIN_NAME}\nThis plugin will NOT WORK until this problem is resolved.`
      );
      return;
    }

    // Use configuration to create clients
    this.mqttTransport = new MySensorsMqttTransport(
      this.log,
      this.pluginConfig
    );
    this.mqttTransport.on(Commands.presentation, (msg, transport) => {
      this.createOrUpdateAccessory(msg, transport);
    });
    this.mqttTransport.on(Commands.set, (msg, transport) => {
      this.handleDeviceUpdate(msg, transport);
    });

    this.serialTransport = new MySensorsSerialTransport(
      this.log,
      this.pluginConfig
    );

    this.serialTransport.on(Commands.presentation, (msg, transport) => {
      this.createOrUpdateAccessory(msg, transport);
    });
    this.serialTransport.on(Commands.set, (msg, transport) => {
      this.handleDeviceUpdate(msg, transport);
    });

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.mqttTransport?.openListener();
      this.serialTransport?.openListener();
    });

    // TODO: add logic to remove stale devices
  }

  publishMessage<T extends Transport>(
    transport: T,
    topic: MySensorsMqttPattern | MySensorsSerialPattern,
    payload: string,
    options?: IClientPublishOptions
  ) {
    if (transport === Transport.MQTT) {
      return this.mqttTransport?.publishMessage(
        topic as MySensorsMqttPattern,
        payload,
        options
      );
    } else if (transport === Transport.SERIAL) {
      return this.serialTransport?.publishMessage(
        `${topic as MySensorsSerialPattern};${payload}`
      );
    }
    this.log.error('Invalid transport', transport);
    return Promise.resolve();
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory<MySensorsContext>): void {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    if (this.accessories.findIndex((acc) => acc.UUID === accessory.UUID) < 0) {
      // New entry
      const displayName = MySensorsAccessory.getDisplayName(
        accessory.context.protocol,
        accessory.context.transport
      );
      this.log.info(`Restoring accessory: ${displayName}`);
      const acc = new MySensorsAccessory(this, accessory);
      // add the restored accessory to the accessories cache so we can track if it has already been registered
      this.accessories.push(acc);
    }
  }

  private findAccessory(
    protocol: MySensorsProtocol,
    transport: Transport
  ): MySensorsAccessory | undefined {
    const displayName = MySensorsAccessory.getDisplayName(protocol, transport);
    const uuid = this.api.hap.uuid.generate(displayName);
    return this.accessories.find((accessory) => accessory.UUID === uuid);
  }

  private createAccessory(
    protocol: MySensorsProtocol<Commands.presentation>,
    transport: Transport
  ): MySensorsAccessory {
    const displayName = MySensorsAccessory.getDisplayName(protocol, transport);
    const uuid = this.api.hap.uuid.generate(displayName);
    this.log.info('Adding new accessory:', displayName);
    const accessory = new this.api.platformAccessory<MySensorsContext>(
      displayName,
      uuid
    );
    accessory.context.protocol = protocol;
    accessory.context.transport = transport;

    // link the accessory to your platform
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
      accessory,
    ]);
    // create the accessory handler for the newly created accessory
    const acc = new MySensorsAccessory(this, accessory);
    this.accessories.push(acc);
    return acc;
  }

  private findOrCreateAccessory(
    protocol: MySensorsProtocol<Commands.presentation>,
    transport: Transport
  ): void {
    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.findAccessory(protocol, transport);
    if (existingAccessory) {
      this.log.info(
        'Restoring existing accessory from cache:',
        existingAccessory.displayName
      );
      // create the accessory handler for the restored accessory
      // this is imported from `platformAccessory.ts`
      new MySensorsAccessory(this, existingAccessory.accessory);
    } else {
      // the accessory does not yet exist, so we need to create it
      this.createAccessory(protocol, transport);
    }
  }

  private createOrUpdateAccessory(
    protocol: MySensorsProtocol,
    transport: Transport
  ): void {
    const existingAccessory = this.findAccessory(protocol, transport);
    if (existingAccessory) {
      existingAccessory.updateDeviceInformation(protocol);
    } else if (protocol.method === Commands.presentation) {
      // the accessory does not yet exist, so we need to create it
      this.createAccessory(
        protocol as MySensorsProtocol<Commands.presentation>,
        transport
      );
    }
  }

  private handleDeviceUpdate(
    protocol: MySensorsProtocol<Commands.set>,
    transport: Transport
  ): void {
    const accessory = this.accessories.find((acc) =>
      acc.matchesIdentifier(protocol, transport)
    );
    if (accessory) {
      try {
        accessory.updateState(protocol);
        this.log.debug(`Handled device update for ${JSON.stringify(protocol)}`);
      } catch (Error) {
        this.log.error(errorToString(Error));
      }
    } else {
      this.log.debug(`Unhandled message on topic: ${JSON.stringify(protocol)}`);
    }
  }

  private removeAccessory(
    protocol: MySensorsProtocol,
    transport: Transport
  ): void {
    const existingAccessory = this.findAccessory(protocol, transport);
    if (!existingAccessory) {
      this.log.info('Cannot remove an accessory that does not exist');
      return;
    }
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
      existingAccessory.accessory,
    ]);
    this.log.info(
      'Removing existing accessory from cache',
      existingAccessory.displayName
    );
  }
}
