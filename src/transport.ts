import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { Logger } from 'homebridge';
import {
  connect,
  IClientOptions,
  IClientPublishOptions,
  MqttClient,
} from 'mqtt';
import SerialPort from 'serialport';

import { MqttConfiguration, PluginConfiguration } from './configModels';
import { mySensorsProtocolDecoder } from './converter/decoder';
import { errorToString } from './helpers';
import {
  Commands,
  MySensorsMqttPattern,
  MySensorsProtocol,
  Transport,
} from './mySensors/protocol';

export interface MySensorsTransportEvents {
  presentation: (
    msg: MySensorsProtocol<Commands.presentation>,
    transport: Transport
  ) => void;
  internal: (
    msg: MySensorsProtocol<Commands.internal>,
    transport: Transport
  ) => void;
  set: (msg: MySensorsProtocol<Commands.set>, transport: Transport) => void;
}

export abstract class MySensorsTransport<
  Client extends SerialPort | MqttClient
> extends EventEmitter {
  protected client: Client | undefined;

  private _untypedOn = this.on;
  private _untypedEmit = this.emit;

  constructor(
    readonly config: PluginConfiguration,
    readonly transport: Transport
  ) {
    super({ captureRejections: true });
  }

  public on = <U extends keyof MySensorsTransportEvents>(
    event: U,
    listener: MySensorsTransportEvents[U]
  ): this => this._untypedOn(event, listener);

  public emit = <U extends keyof MySensorsTransportEvents>(
    event: U,
    ...args: Parameters<MySensorsTransportEvents[U]>
  ): boolean => this._untypedEmit(event, ...args);

  public handleMessage(
    protocol: MySensorsProtocol,
    transport: Transport
  ): void {
    switch (protocol.method) {
      case Commands.presentation:
        // register device/sensors
        this.emit(
          'presentation',
          protocol as MySensorsProtocol<Commands.presentation>,
          transport
        );
        break;
      case Commands.internal:
        // internal mysensors command
        this.emit(
          'internal',
          protocol as MySensorsProtocol<Commands.internal>,
          transport
        );
        break;
      case Commands.set:
        // Probably a status update from a device
        this.emit(
          'set',
          protocol as MySensorsProtocol<Commands.set>,
          transport
        );
        break;
      case Commands.req:
        // state request - ignored
        break;
      case Commands.stream:
        // OTA update - ignored
        break;
    }
  }

  abstract initializeClient(config: PluginConfiguration): Client | undefined;

  abstract openListener(): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract onMessage(...args: any): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract publishMessage(...args: any): void | Promise<void>;

  abstract isConnected(): boolean;
}

export class MySensorsMqttTransport extends MySensorsTransport<MqttClient> {
  private readonly mqttConfig: Partial<MqttConfiguration>;

  constructor(
    public readonly log: Logger,
    readonly config: PluginConfiguration
  ) {
    super(config, Transport.MQTT);
    this.mqttConfig = this.config.mqtt || {};
    this.onMessage = this.onMessage.bind(this);
    this.client = this.initializeClient(config);
  }

  private createOptions(): IClientOptions {
    const {
      version,
      keepalive,
      ca,
      key,
      cert,
      user,
      password,
      rejectUnauthorized,
      clientId,
    } = this.mqttConfig;
    const options: IClientOptions = {};
    if (version) {
      options.protocolVersion = version;
    }

    if (keepalive) {
      this.log.debug(`Using MQTT keepalive: ${keepalive}`);
      options.keepalive = keepalive;
    }

    if (ca) {
      this.log.debug(`MQTT SSL/TLS: Path to CA certificate = ${ca}`);
      options.ca = readFileSync(ca);
    }

    if (key && cert) {
      this.log.debug(`MQTT SSL/TLS: Path to client key = ${key}`);
      this.log.debug(`MQTT SSL/TLS: Path to client certificate = ${cert}`);
      options.key = readFileSync(key);
      options.cert = readFileSync(cert);
    }

    if (user && password) {
      options.username = user;
      options.password = password;
    }

    if (clientId) {
      this.log.debug(`Using client ID: '${clientId}'`);
      options.clientId = clientId;
    }

    if (rejectUnauthorized !== undefined && !rejectUnauthorized) {
      this.log.debug(
        'MQTT reject_unauthorized set false, ignoring certificate warnings.'
      );
      options.rejectUnauthorized = false;
    }

    return options;
  }

  initializeClient(config: PluginConfiguration): MqttClient | undefined {
    if (!config.mqtt?.server) {
      this.log.error('No MQTT server defined');
      return;
    }
    this.log.info(`Connecting to MQTT server at ${config.mqtt.server}`);
    const options = this.createOptions();
    const mqttClient = connect(config.mqtt.server, options);
    mqttClient.on('connect', () => {
      this.log.info('Connected to MQTT server');
    });
    return mqttClient;
  }

  openListener(): void {
    // Setup MQTT callbacks and subscription
    if (this.client instanceof MqttClient) {
      this.client.on('message', this.onMessage);
      // TODO: limit subscriptions ? for specific gateways ?
      this.client.subscribe('#');
    }
  }

  onMessage(topic: MySensorsMqttPattern, payload: Buffer): void {
    const protocol = mySensorsProtocolDecoder(
      Transport.MQTT,
      topic,
      payload.toString()
    );
    if (!protocol) {
      this.log.debug(
        'Ignore message, because protocol does not match MySensors MQTT API.',
        topic
      );
      return;
    }
    super.handleMessage(protocol, Transport.MQTT);
  }

  publishMessage(
    topic: MySensorsMqttPattern,
    payload: string,
    options: IClientPublishOptions = {}
  ): Promise<void> {
    if (this.config !== undefined) {
      options = { qos: 0, retain: false, ...options };
      if (!this.isConnected) {
        this.log.error('Not connected to MQTT server!');
        this.log.error(`Cannot send message '${topic}': '${payload}`);
        return Promise.resolve();
      }

      this.log.info(`Publish '${topic}': '${payload}'`);
      return new Promise<void>((resolve) => {
        this.client?.publish(topic, payload, options, (error) => {
          if (error) {
            this.log.error(errorToString(error));
          }
          resolve();
        });
      });
    }
    return Promise.resolve();
  }

  isConnected(): boolean {
    return this.client !== undefined && !this.client.reconnecting;
  }
}
