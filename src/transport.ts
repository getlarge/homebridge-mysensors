import Readline from '@serialport/parser-readline';
import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { Logger } from 'homebridge';
import {
  connect,
  IClientOptions,
  IClientPublishOptions,
  MqttClient,
} from 'mqtt';
import SerialPort, { OpenOptions } from 'serialport';

import {
  MqttConfiguration,
  PluginConfiguration,
  SerialConfiguration,
} from './configModels';
import { mySensorsProtocolDecoder } from './converter/decoder';
import { errorToString } from './helpers';
import {
  Commands,
  MySensorsMqttPattern,
  MySensorsProtocol,
  MySensorsSerialPattern,
  Transport,
} from './mySensors/protocol';

export interface MySensorsTransportEvents {
  [Commands.presentation]: (
    msg: MySensorsProtocol<Commands.presentation>,
    transport: Transport
  ) => void;
  [Commands.internal]: (
    msg: MySensorsProtocol<Commands.internal>,
    transport: Transport
  ) => void;
  [Commands.set]: (
    msg: MySensorsProtocol<Commands.set>,
    transport: Transport
  ) => void;
  [Commands.req]: (
    msg: MySensorsProtocol<Commands.req>,
    transport: Transport
  ) => void;
  [Commands.stream]: (
    msg: MySensorsProtocol<Commands.stream>,
    transport: Transport
  ) => void;

  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
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
          protocol.method,
          protocol as MySensorsProtocol<Commands.presentation>,
          transport
        );
        break;
      case Commands.internal:
        // internal mysensors command
        this.emit(
          protocol.method,
          protocol as MySensorsProtocol<Commands.internal>,
          transport
        );
        break;
      case Commands.set:
        // Probably a status update from a device
        this.emit(
          protocol.method,
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
  readonly publishPrefix: string;
  readonly subscribePrefix: string;

  constructor(
    public readonly log: Logger,
    readonly config: PluginConfiguration
  ) {
    super(config, Transport.MQTT);
    this.mqttConfig = this.config.mqtt || {};
    this.publishPrefix = this.config.mqtt?.publishPrefix || 'out';
    this.subscribePrefix = this.config.mqtt?.subscribePrefix || 'in';
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
        'MQTT rejectUnauthorized set false, ignoring certificate warnings.'
      );
      options.rejectUnauthorized = false;
    }

    return options;
  }

  initializeClient(config: PluginConfiguration): MqttClient | undefined {
    if (!config.mqtt?.server) {
      this.log.error('No MQTT broker defined');
      return;
    }
    this.log.info(`Connecting to MQTT broker at ${config.mqtt.server}`);
    const options = this.createOptions();
    const mqttClient = connect(config.mqtt.server, options);
    mqttClient.on('connect', () => {
      this.log.info('Connected to MQTT broker');
      this.emit('connect');
    });
    mqttClient.on('close', () => {
      this.log.info('Disconnected from MQTT broker');
      this.emit('disconnect');
    });

    mqttClient.on('error', (err) => {
      this.log.error(errorToString(err));
      this.emit('error', err);
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
    if (
      !topic.startsWith(this.publishPrefix) &&
      !topic.startsWith(this.subscribePrefix)
    ) {
      // this.log.debug(
      //   `Ignore message, because prefix does not match ${this.publishPrefix} or ${this.subscribePrefix}`,
      //   topic
      // );
      return;
    }
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
      if (!this.isConnected || !this.client) {
        this.log.error('Not connected to MQTT server!');
        this.log.error(`Cannot send message '${topic}': '${payload}`);
        return Promise.resolve();
      }

      this.log.info(`MQTT Publish '${topic}': '${payload}'`);
      return new Promise<void>((resolve) => {
        this.client!.publish(topic, payload, options, (error) => {
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

export class MySensorsSerialTransport extends MySensorsTransport<SerialPort> {
  private serialConfig: Partial<SerialConfiguration>;

  constructor(
    public readonly log: Logger,
    readonly config: PluginConfiguration
  ) {
    super(config, Transport.SERIAL);
    this.serialConfig = this.config.serial || {};
    this.onMessage = this.onMessage.bind(this);
    this.client = this.initializeClient(config);
  }

  private createOptions(): OpenOptions {
    const { baudRate } = this.serialConfig;
    const options: OpenOptions = {
      autoOpen: true,
    };
    if (baudRate) {
      this.log.debug(`Using Serial baud rate: ${baudRate}`);
      options.baudRate = baudRate;
    }
    return options;
  }

  initializeClient(config: PluginConfiguration): SerialPort | undefined {
    if (!config.serial?.port) {
      this.log.error('No Serial port defined');
      return;
    }
    this.log.info(`Connecting to Serial port at ${config.serial.port}`);
    const options = this.createOptions();
    const serialClient = new SerialPort(config.serial.port, options);
    serialClient.on('open', () => {
      this.log.info('Connected to Serial port');
      this.emit('connect');
    });
    serialClient.on('close', () => {
      this.log.info('Disconnected from Serial port');
      this.emit('disconnect');
    });
    serialClient.on('error', (err) => {
      this.log.error(errorToString(err));
      this.emit('error', err);
    });
    return serialClient;
  }

  openListener(): void {
    // Setup Serial parser
    if (this.client instanceof SerialPort) {
      const parser = this.client?.pipe(new Readline({ delimiter: '\r\n' }));
      parser.on('data', this.onMessage);
    }
  }

  onMessage(message: MySensorsSerialPattern): void {
    const protocol = mySensorsProtocolDecoder(Transport.SERIAL, message);
    if (!protocol) {
      this.log.debug(
        'Ignore message, because protocol does not match MySensors Serial API.',
        message
      );
      return;
    }
    super.handleMessage(protocol, Transport.SERIAL);
  }

  publishMessage(message: MySensorsSerialPattern): Promise<void> {
    if (this.config !== undefined) {
      if (!this.isConnected || !this.client) {
        this.log.error('Not connected to Serial gateway');
        this.log.error(`Cannot send message to '${message}'}`);
        return Promise.resolve();
      }
      this.log.info(`Serial Publish '${message}'`);
      return new Promise<void>((resolve) => {
        this.client!.write(message, (error) => {
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
    return this.client !== undefined && this.client.isOpen;
  }
}
