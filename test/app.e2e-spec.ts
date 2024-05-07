import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ResponseExceptionFilter } from '../src/shared/filters/reponse-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new ResponseExceptionFilter());

    await app.startAllMicroservices();
    await app.init();
  });

  it('/ (GET)', async () => {
    const resp = await request(app.getHttpServer()).get('/');

    expect(resp).toBeDefined();
    expect(resp.body.message).toBe(null);
    expect(resp.body.data).toBe('Hello World!');
  });
});
