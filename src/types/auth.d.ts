declare global {
  namespace Express {
    interface User {
      avatar: null | string
      email: string
      id: number
      uuid: string
      iat: number
      exp: number
    }
  }
}
