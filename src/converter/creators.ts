import { Commands, MySensorsProtocol } from '../mySensors/protocol';
import { BasicSensorCreator } from './basicSensors';
import { BasicAccessory, ServiceCreator } from './interfaces';

export interface ServiceCreatorManager {
  createHomeKitEntitiesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void;
}

interface ServiceCreatorConstructor {
  new (): ServiceCreator;
}

export class BasicServiceCreatorManager implements ServiceCreatorManager {
  private static readonly constructors: ServiceCreatorConstructor[] = [
    BasicSensorCreator,
  ];

  private static instance: BasicServiceCreatorManager;

  private creators: ServiceCreator[];

  private constructor() {
    this.creators = BasicServiceCreatorManager.constructors.map((c) => new c());
  }

  public static getInstance(): BasicServiceCreatorManager {
    if (BasicServiceCreatorManager.instance === undefined) {
      BasicServiceCreatorManager.instance = new BasicServiceCreatorManager();
    }
    return BasicServiceCreatorManager.instance;
  }

  createHomeKitEntitiesFromPresentation(
    accessory: BasicAccessory,
    protocol: MySensorsProtocol<Commands.presentation>
  ): void {
    for (const c of this.creators) {
      try {
        c.createServicesFromPresentation(accessory, protocol);
      } catch (e) {
        accessory.log.error(
          `Exception occurred when creating services for ${accessory.displayName}: ${e}`
        );
      }
    }
  }
}
