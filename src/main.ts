import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

function createSwaggerUI(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Nothing token swap service API')
    .setDescription('The Nothing token swap service API description')
    .setVersion('1.0')
    .addTag('nothingtokenswapservice-api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document);
}

async function bootstrap() {

  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableShutdownHooks();
  createSwaggerUI(app);
  await app.listen(3300, '0.0.0.0');//
  console.log('service start at port 3300')
  //new CronService().start()
  //new OneInchTokenList().getTokenList()
}
bootstrap();
