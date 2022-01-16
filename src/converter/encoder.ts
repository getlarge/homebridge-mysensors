import {
  isValidAck,
  isValidDirection,
  isValidId,
  isValidMethod,
  isValidPayload,
  isValidSensorType,
} from '../mySensors/helpers';
import {
  MySensorsMqttPattern,
  MySensorsProtocol,
  MySensorsSerialPattern,
  Transport,
} from '../mySensors/protocol';

export function mySensorsSerialEncoder(
  protocol: MySensorsProtocol
): MySensorsSerialPattern | null {
  const { nodeId, childId, method, ack, type, payload } = protocol;
  if (
    isValidId(nodeId) &&
    isValidId(childId) &&
    isValidMethod(method) &&
    isValidAck(ack.toString()) &&
    isValidSensorType(method, type) &&
    isValidPayload(payload)
  ) {
    return `${nodeId};${childId};${method};${ack};${type};${payload}`;
  }
  return null;
}

export function mySensorsMqttEncoder(protocol: MySensorsProtocol): {
  topic: MySensorsMqttPattern;
  payload: string;
} | null {
  const { gatewayAndDirection, nodeId, childId, method, ack, type, payload } =
    protocol;

  if (
    isValidDirection(gatewayAndDirection) &&
    isValidId(nodeId) &&
    isValidId(childId) &&
    isValidMethod(method) &&
    isValidAck(ack.toString()) &&
    isValidSensorType(method, type) &&
    isValidPayload(payload)
  ) {
    return {
      topic: `${gatewayAndDirection}/${nodeId}/${childId}/${method}/${ack}/${type}`,
      payload: payload.toString(),
    };
  }
  return null;
}

/**
 * Serialize ProtocolRef object to [MySensors protocol]{@link /mysensors/#mysensorsapi} string
 * @method mySensorsEncoder
 * @param {object} protocol - MySensors protocol object.
 * @param {object} transport - MySensors transport.
 * @throws {Error} 'Wrong protocol input'
 * @returns {object | string | null} packet or serial message
 */
export function mySensorsEncoder<T extends Transport = Transport.SERIAL>(
  protocol: MySensorsProtocol,
  transport: T
): MySensorsSerialPattern;
export function mySensorsEncoder<T extends Transport = Transport.MQTT>(
  protocol: MySensorsProtocol,
  transport: T
): {
  topic: MySensorsMqttPattern;
  payload: string;
};
export function mySensorsEncoder<T extends Transport>(
  protocol: MySensorsProtocol,
  transport: T
):
  | MySensorsSerialPattern
  | {
      topic: MySensorsMqttPattern;
      payload: string;
    }
  | null {
  if (transport === Transport.MQTT) {
    return mySensorsMqttEncoder(protocol);
  } else if (transport === Transport.SERIAL) {
    return mySensorsSerialEncoder(protocol);
  } else {
    return null;
  }
}
