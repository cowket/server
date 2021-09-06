import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Cowket Server Document')
    .setDescription('Cowket Server Document on Swagger')
    .setVersion('1.0')
    .addTag('cowket')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  app.enableCors()

  await app.listen(4000)
}
bootstrap()
