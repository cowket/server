import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnonymousUser } from 'src/entities/anonymous_user'
import { AnonymousWorkspace } from 'src/entities/anonymous_workspace'
import { UtilModule } from 'src/util/util.module'
import { AnonymousController } from './anonymous.controller'
import { AnonymousService } from './anonymous.service'

@Module({
  imports: [TypeOrmModule.forFeature([AnonymousUser, AnonymousWorkspace]), UtilModule],
  controllers: [AnonymousController],
  providers: [AnonymousService]
})
export class AnonymousModule {}
