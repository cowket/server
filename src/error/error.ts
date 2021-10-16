export class UniqueChannelError extends Error {
  constructor() {
    super('UniqueChannelError')
    this.name = 'UniqueChannelError'
  }
}

export class NotOwnerError extends Error {
  constructor() {
    super('NotOwnerError')
    this.name = 'NotOwnerError'
  }
}

export class NotPrivateChannelError extends Error {
  constructor() {
    super('NotPrivateChannelError')
    this.name = 'NotPrivateChannelError'
  }
}
