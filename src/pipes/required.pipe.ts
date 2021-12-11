import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class RequiredValuePipe<T extends unknown> implements PipeTransform {
  transform(value: T, _metadata: ArgumentMetadata) {
    if (!value) throw new BadRequestException(null, '필수 값 누락')
    return value
  }
}
