enum SocketEvent {
  PUSH_DIRECT_MESSAGE = 'pushDirectMessage',
  NEW_DIRECT_MESSAGE = 'newDirectMessage',
  PUSH_MESSAGE = 'pushMessage',
  NEW_MESSAGE = 'newMessage',
  JOIN_ROOM = 'joinRoom',
  LOAD_MESSAGE = 'loadMessage',
  LOAD_DIRECT_MESSAGE = 'loadDirectMessage',
  CONNECTION_WITH_AUTH = 'cowket:connection-with-auth-required',
  LOADED_SCROLL_MESSAGE = 'loadedScrollMessage',
  LOADED_SCROLL_DIRECT_MESSAGE = 'loadedScrollMessage'
}

type TSocketEvent =
  | 'PUSH_DIRECT_MESSAGE'
  | 'NEW_DIRECT_MESSAGE'
  | 'PUSH_MESSAGE'
  | 'NEW_MESSAGE'
  | 'JOIN_ROOM'
  | 'LOAD_MESSAGE'
  | 'LOAD_DIRECT_MESSAGE'
  | 'CONNECTION_WITH_AUTH'
  | 'LOADED_SCROLL_MESSAGE'
  | 'LOADED_SCROLL_DIRECT_MESSAGE'

export function getSocketEvent(eventName: TSocketEvent) {
  return SocketEvent[eventName]
}
