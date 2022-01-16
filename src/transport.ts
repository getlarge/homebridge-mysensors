import EventEmitter from 'events';
import { MqttClient } from 'mqtt';
import SerialPort from 'serialport';

import { PluginConfiguration } from './configModels';
import { Commands, MySensorsProtocol, Transport } from './mySensors/protocol';

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
