import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
      .setTitle('Vulnerable API Example')
      .setDescription('ตัวอย่าง API ที่มีช่องโหว่สำหรับทดสอบ OWASP API Scanner')
      .setVersion('1.0')
      .addTag('example-api')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3030);
}
bootstrap();
