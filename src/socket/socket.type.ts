enum SocketEvent {
  PUSH_DIRECT_MESSAGE = 'pushDirectMessage'
}

type TSocketEvent = 'PUSH_DIRECT_MESSAGE'

export function getSocketEvent(eventName: TSocketEvent) {
  return SocketEvent[eventName]
}
