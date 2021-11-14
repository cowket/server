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
  LOADED_SCROLL_DIRECT_MESSAGE = 'loadedScrollMessage',
  DELETE_MESSAGE = 'deleteMessage',
  DELETE_DIRECT_MESSAGE = 'deleteDirectMessage',
  DELETED_MESSAGE = 'deletedMessage',
  DELETED_DIRECT_MESSAGE = 'deletedDirectMessage',
  UPDATE_MESSAGE = 'updateMessage',
  UPDATE_DIRECT_MESSAGE = 'updateDirectMessage',
  UPDATED_MESSAGE = 'updatedMessage',
  UPDATED_DIRECT_MESSAGE = 'updatedDirectMessage'
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
  | 'DELETE_MESSAGE'
  | 'DELETE_DIRECT_MESSAGE'
  | 'DELETED_MESSAGE'
  | 'DELETED_DIRECT_MESSAGE'
  | 'UPDATE_MESSAGE'
  | 'UPDATE_DIRECT_MESSAGE'
  | 'UPDATED_MESSAGE'
  | 'UPDATED_DIRECT_MESSAGE'

export function getSocketEvent(eventName: TSocketEvent) {
  return SocketEvent[eventName]
}
