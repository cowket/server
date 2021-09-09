import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { CorsOptions } from 'cors'

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

  const defaultCorsOptions: CorsOptions = {
    credentials: true,
    methods: 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
    exposedHeaders: ['Authorization'],
    allowedHeaders: ['Authorization', 'Content-Type']
  }

  app.enableCors((req, callback) => {
    // 테스트용... 추후 수정 필요
    callback(null, { origin: req.header('Origin'), ...defaultCorsOptions })
  })

  await app.listen(4000)
}
bootstrap()
