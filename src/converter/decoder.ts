import {
  getTypeFromMethod,
  isValidAck,
  isValidDirection,
  isValidId,
  isValidMethod,
  isValidPayload,
  isValidSensorType,
} from '../mySensors/helpers';
import {
  Ack,
  Commands,
  CommandsAsInteger,
  Directions,
  MySensorsMqttPattern,
  MySensorsProtocol,
  MySensorsSerialPattern,
  Payload,
  Separator,
  Transport,
} from '../mySensors/protocol';

interface MySensorsParams {
  gatewayAndDirection?: `${string}-${Directions}`;
  nodeId?: `${number}`;
  childId?: `${number}`;
  method?: `${CommandsAsInteger}`;
  ack?: `${Ack}`;
  type?: `${number}`;
  payload?: `${Payload}`;
}

function extractParams(
  topic: MySensorsMqttPattern | MySensorsSerialPattern | string,
  separator: '/' | ';' = '/'
): MySensorsParams {
  const [gatewayAndDirection, nodeId, childId, method, ack, type, payload] =
    topic.split(separator) as [
      `${string}-${Directions}`,
      `${number}`,
      `${number}`,
      `${CommandsAsInteger}`,
      `${Ack}`,
      `${number}`,
      `${Payload}`
    ];

  return { gatewayAndDirection, nodeId, childId, method, ack, type, payload };
}

function getMySensorsProtocol(
  params: MySensorsParams,
  payload?: string
): MySensorsProtocol<Commands> | null {
  const { gatewayAndDirection, nodeId, childId, method, ack, type } = params;
  payload = typeof payload === 'undefined' ? params.payload : payload;
  const sensorType = getTypeFromMethod(Number(method), Number(type));
  if (
    isValidDirection(gatewayAndDirection) &&
    isValidId(nodeId) &&
    isValidId(childId) &&
    isValidMethod(method) &&
    isValidAck(ack) &&
    isValidSensorType(method, sensorType) &&
    isValidPayload(payload)
  ) {
    return {
      gatewayAndDirection,
      nodeId: Number(nodeId),
      childId: Number(childId),
      method: Object.values(Commands)[Number(method)],
      ack: Number(ack) as Ack,
      type: sensorType,
      payload,
    };
  }
  return null;
}

export function mySensorsMqttProtocolDecoder(
  topic: MySensorsMqttPattern | string,
  payload?: string
): MySensorsProtocol<Commands> | null {
  const params = extractParams(topic, Separator.MQTT);
  return getMySensorsProtocol(params, payload);
}

export function mySensorSerialProtocolDecoder(
  message: MySensorsSerialPattern | string
) {
  const params = extractParams(message, Separator.SERIAL);
  return getMySensorsProtocol(params);
}

export function mySensorsProtocolDecoder<
  T extends Transport = Transport.SERIAL
>(
  transport: T,
  message: MySensorsSerialPattern
): MySensorsProtocol<Commands> | null;
export function mySensorsProtocolDecoder<T extends Transport = Transport.MQTT>(
  transport: T,
  message: MySensorsMqttPattern,
  payload: string
): MySensorsProtocol<Commands> | null;
export function mySensorsProtocolDecoder(
  transport: Transport,
  message: MySensorsMqttPattern | MySensorsSerialPattern | string,
  payload?: string
): MySensorsProtocol<Commands> | null {
  if (transport === Transport.MQTT) {
    return mySensorsMqttProtocolDecoder(message, payload);
  } else if (transport === Transport.SERIAL) {
    return mySensorSerialProtocolDecoder(message);
  } else {
    return null;
  }
}
