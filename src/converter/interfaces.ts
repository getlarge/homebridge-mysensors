import { Service } from 'homebridge';

import {
  Commands,
  MySensorsProtocol,
  SensorTypes,
  Transport,
  VariableTypes,
} from '../mySensors/protocol';

export interface BasicAccessory {
  log: BasicLogger;
  displayName: string;
  getDefaultServiceDisplayName(subType: string | undefined): string;
  getOrAddService(service: Service): Service;
  queueDataForSetAction(
    children: {
      childId: number;
      resource: VariableTypes;
      data: string;
    }[]
  ): void;
  queueKeyForGetAction(
    children: { childId: number; resources: VariableTypes | VariableTypes[] }[]
  ): void;
  registerServiceHandler(handler: ServiceHandler): void;
  isServiceHandlerIdKnown(identifier: string): boolean;
}

export interface ServiceHandler {
  identifier: string;
  sensorType: SensorTypes;
  childId: number;
  getableKeys: `${VariableTypes}`[];
  updateState(state: Record<string, unknown>): void;
}

export interface ServiceCreator {
  createServicesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void;
}

export interface BasicLogger {
  info(message: string, ...parameters: unknown[]): void;
  warn(message: string, ...parameters: unknown[]): void;
  error(message: string, ...parameters: unknown[]): void;
  debug(message: string, ...parameters: unknown[]): void;
}

export interface MySensorsContext<C extends Commands = Commands> {
  protocol: MySensorsProtocol<C>;
  sensorType: SensorTypes;
  transport: Transport;
}
