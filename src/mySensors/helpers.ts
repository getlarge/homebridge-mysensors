import { internals } from './internals';
import { presentations } from './presentations';
import {
  Ack,
  Commands,
  CommandsAsInteger,
  InternalTypes,
  Methods,
  MySensorsProtocol,
  Payload,
  SensorTypes,
  Type,
  VariableTypes,
} from './protocol';
import { sets } from './sets';

export function isValidId(x?: string | number): x is string | number {
  const id = Number(x);
  return !isNaN(id) && id <= 255;
}

export function isSensorType(type?: Type | string): type is SensorTypes {
  return (
    typeof type !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(presentations, type)
  );
}

export function isInternalType(type?: Type | string): type is InternalTypes {
  return (
    typeof type !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(internals, type)
  );
}

export function isVariableType(type?: Type | string): type is VariableTypes {
  return (
    typeof type !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(sets, type)
  );
}

export function isValidAck(ack?: string | number): ack is `${Ack}` {
  return (
    (typeof ack === 'string' && (ack === '0' || ack === '1')) ||
    (typeof ack === 'number' && (ack === 0 || ack === 1))
  );
}

export function isValidPayload(x?: string | number): x is Payload {
  return typeof x === 'string' || typeof x === 'number';
}

// incoming message
export function getTypeFromMethod(
  method: number,
  type: number
): Type | undefined {
  if (method === Methods.presentation) {
    return Object.values(SensorTypes)[type];
  } else if (method === Methods.internal) {
    return Object.values(InternalTypes)[type];
  } else if (method === Methods.set || method === Methods.req) {
    return Object.values(VariableTypes)[type];
  }
  return undefined;
}

export function isValidMethod(x?: string): x is CommandsAsInteger {
  return Object.values(Methods).some((meth) => meth === Number(x));
}

export function isValidCommand(x?: string): x is Commands {
  return Object.values(Commands).some((cmd) => cmd === x);
}

export function isValidSensorType(
  method?: string | Commands,
  sensorType?: Type | string
): sensorType is Type {
  let methodInteger: number;
  if (method && isValidCommand(method)) {
    methodInteger = Object.values(Commands).indexOf(method);
  } else {
    methodInteger = Number(method);
  }
  if (methodInteger === Methods.presentation) {
    return isSensorType(sensorType);
  } else if (methodInteger === Methods.internal) {
    return isInternalType(sensorType);
  } else if (methodInteger === Methods.set || methodInteger === Methods.req) {
    return isVariableType(sensorType);
  }
  return false;
}

export function isMySensorsProtocol<C extends Commands = Commands>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
): params is MySensorsProtocol<C> {
  const requiredKeys = ['nodeId', 'childId', 'method', 'ack', 'type'];
  if (typeof params !== 'object') {
    return false;
  }
  for (const key of requiredKeys) {
    if (!params || !(key in params)) {
      return false;
    }
  }
  const { nodeId, childId, method, ack, type, payload } = params;

  return (
    isValidId(nodeId) &&
    isValidId(childId) &&
    isValidCommand(method) &&
    isValidAck(ack) &&
    isValidSensorType(method, type) &&
    isValidPayload(payload)
  );
}

export function protocolsAreEquals(
  first: MySensorsProtocol | undefined,
  second: MySensorsProtocol | undefined
): boolean {
  if (first === undefined || second === undefined) {
    return first === undefined && second === undefined;
  }

  if (
    first.nodeId !== second.nodeId ||
    first.childId !== second.childId ||
    first.type !== second.type
  ) {
    return false;
  }

  return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resourcesCanBeGet(_resources: `${VariableTypes}`[]) {
  // TODO: create object with gettable resources
  return true;
}

export function getEndpoint(
  nodeId: number | string,
  childId: number | string,
  sensorType: `${SensorTypes}`
) {
  return `${nodeId}_${childId}_${sensorType}`;
}
