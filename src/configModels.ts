import { Logger, PlatformConfig } from 'homebridge';

export interface PluginConfiguration extends PlatformConfig {
  mqtt?: MqttConfiguration;
  serial?: SerialConfiguration;
}

export const isPluginConfiguration = (
  x: PlatformConfig,
  logger: Logger | undefined = undefined
): x is PluginConfiguration => {
  if (x.mqtt === undefined && x.serial === undefined) {
    logger?.error(
      'Incorrect configuration: oneof mqtt or serial config is required'
    );
    return false;
  }
  if (x.mqtt !== undefined && !isMqttConfiguration(x.mqtt)) {
    logger?.error(
      'Incorrect configuration: mqtt does not contain required fields'
    );
    return false;
  }
  if (x.serial !== undefined && !isSerialConfiguration(x.serial)) {
    logger?.error(
      'Incorrect configuration: serial does not contain required fields'
    );
    return false;
  }

  return true;
};

export interface MqttConfiguration extends Record<string, unknown> {
  server: string;
  ca?: string;
  key?: string;
  cert?: string;
  user?: string;
  password?: string;
  clientId?: string;
  rejectUnauthorized?: boolean;
  keepalive?: number;
  version?: number;
  disableQos?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMqttConfiguration = (x: any): x is MqttConfiguration =>
  x.server !== undefined && typeof x.server === 'string' && x.server.length > 0;

export interface SerialConfiguration extends Record<string, unknown> {
  port: string;
  baudRate: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSerialConfiguration = (x: any): x is SerialConfiguration =>
  x.port !== undefined && typeof x.port === 'string' && x.port.length > 0;
