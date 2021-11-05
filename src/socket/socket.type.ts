enum SocketEvent {
  PUSH_DIRECT_MESSAGE = 'pushDirectMessage',
  NEW_DIRECT_MESSAGE = 'newDirectMessage',
  PUSH_MESSAGE = 'pushMessage',
  NEW_MESSAGE = 'newMessage',
  JOIN_ROOM = 'joinRoom',
  LOAD_MESSAGE = 'loadMessage',
  CONNECTION_WITH_AUTH = 'cowket:connection-with-auth-required'
}

type TSocketEvent =
  | 'PUSH_DIRECT_MESSAGE'
  | 'NEW_DIRECT_MESSAGE'
  | 'PUSH_MESSAGE'
  | 'NEW_MESSAGE'
  | 'JOIN_ROOM'
  | 'LOAD_MESSAGE'
  | 'CONNECTION_WITH_AUTH'

export function getSocketEvent(eventName: TSocketEvent) {
  return SocketEvent[eventName]
}
