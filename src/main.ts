import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { CorsOptions } from 'cors'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Cowket API')
    .setDescription('Cowket API Document')
    .setVersion('1.0')
    .addTag('cowket')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token'
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      docExpansion: 'none' // default collapse
    }
  })

  const defaultCorsOptions: CorsOptions = {
    credentials: true,
    methods: 'GET, POST, OPTIONS, HEAD, PUT, DELETE',
    exposedHeaders: ['Authorization'],
    allowedHeaders: ['Authorization', 'Content-Type']
  }

  const path =
    process.env.NODE_ENV === 'production'
      ? join(__dirname, 'public')
      : join(__dirname, '..', 'public')

  app.useStaticAssets(path, {
    prefix: '/uploads'
  })

  app.enableCors((req, callback) => {
    // 테스트용... 추후 수정 필요
    callback(null, { origin: req.header('Origin'), ...defaultCorsOptions })
  })

  await app.listen(4000)
}
bootstrap()
