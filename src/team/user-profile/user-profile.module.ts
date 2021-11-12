import { Module } from '@nestjs/common'
import { UserProfileService } from './user-profile.service'

@Module({
  providers: [UserProfileService]
})
export class UserProfileModule {}
