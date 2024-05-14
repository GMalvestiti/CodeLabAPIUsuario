import { fakerPT_BR as faker } from '@faker-js/faker';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Usuario } from '../src/core/usuario/entities/usuario.entity';
import { EMensagem } from '../src/shared/enums/mensagem.enum';
import { ResponseExceptionFilter } from '../src/shared/filters/reponse-exception.filter';
import { ResponseTransformInterceptor } from '../src/shared/interceptors/response-transform.interceptor';

describe('Usuario (e2e)', () => {
  let app: INestApplication;

  let repository: Repository<Usuario>;

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

    repository = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  afterAll(async () => {
    await repository.delete({});
    await app.close();
  });

  describe('CRUD /usuario', () => {
    let id: number;

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const usuario = {
      nome: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      senha: faker.internet.password(),
      ativo: true,
      admin: false,
    };

    it('criar um novo usuário', async () => {
      const resp = await request(app.getHttpServer())
        .post('/usuario')
        .send(usuario);

      expect(resp.status).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.SALVO_SUCESSO);
      expect(resp.body.data).toHaveProperty('id');

      id = resp.body.data.id;
    });

    it('criar um novo usuário usando o mesmo email', async () => {
      const resp = await request(app.getHttpServer())
        .post('/usuario')
        .send(usuario);

      expect(resp.status).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IMPOSSIVEL_CADASTRAR);
      expect(resp.body.data).toBe(null);
    });

    it('carregar o usuário criado', async () => {
      const resp = await request(app.getHttpServer()).get(`/usuario/${id}`);

      expect(resp.status).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.nome).toBe(usuario.nome);
      expect(resp.body.data.email).toBe(usuario.email);
      expect(resp.body.data.ativo).toBe(usuario.ativo);
      expect(resp.body.data.admin).toBe(usuario.admin);
      expect(resp.body.data.password).toBe(undefined);
      expect(resp.body.data).toHaveProperty('permissao');
    });

    it('alterar um usuário criado', async () => {
      const usuarioAlterado = Object.assign(usuario, { id: id, admin: true });

      const resp = await request(app.getHttpServer())
        .patch(`/usuario/${id}`)
        .send(usuarioAlterado);

      expect(resp.status).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.ATUALIZADO_SUCESSO);
      expect(resp.body.data.admin).toBe(true);
    });

    it('lança uma exceção ao alterar um usuário criado passando um id diferente', async () => {
      const usuarioAlterado = Object.assign(usuario, { id: id, admin: true });

      const resp = await request(app.getHttpServer())
        .patch(`/usuario/999`)
        .send(usuarioAlterado);

      expect(resp.status).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IDS_DIFERENTES);
      expect(resp.body.data).toBe(null);
    });

    it('lança uma exceção ao alterar um usuário utilizando um email já utilizado', async () => {
      const firstNameTemp = faker.person.firstName();
      const lastNameTemp = faker.person.lastName();

      const usuarioTemp = {
        nome: `${firstNameTemp} ${lastNameTemp}`,
        email: usuario.email,
        senha: faker.internet.password(),
        ativo: true,
        admin: false,
      };

      await request(app.getHttpServer()).post('/usuario').send(usuarioTemp);

      const usuarioAlterado = Object.assign(usuario, {
        email: usuarioTemp.email,
      });

      const resp = await request(app.getHttpServer())
        .post(`/usuario/${id}`)
        .send(usuarioAlterado);

      expect(resp.status).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IMPOSSIVEL_ALTERAR);
      expect(resp.body.data).toBe(null);
    });

    it('desativar um usuário cadastrado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/usuario/${id}`);

      expect(resp.status).toBeDefined();
      expect(resp.body.message).toBe(EMensagem.DESATIVADO_SUCESSO);
      expect(resp.body.data).toBe(false);
    });

    it('lançar uma exceção ao desativar um usuário não cadastrado', async () => {
      const resp = await request(app.getHttpServer()).delete(`/usuario/999`);

      expect(resp.status).toBeDefined();
      expect(resp.status).toBe(HttpStatus.NOT_ACCEPTABLE);
      expect(resp.body.message).toBe(EMensagem.IMPOSSIVEL_DESATIVAR);
      expect(resp.body.data).toBe(null);
    });
  });

  describe('findAll /usuario', () => {
    it('obter todos os registros da página 1', async () => {
      for (let i = 0; i < 10; i++) {
        const firstNameTemp = faker.person.firstName();
        const lastNameTemp = faker.person.lastName();

        const usuarioTemp = {
          nome: `${firstNameTemp} ${lastNameTemp}`,
          email: faker.internet
            .email({ firstName: firstNameTemp, lastName: firstNameTemp })
            .toLowerCase(),
          senha: faker.internet.password(),
          ativo: true,
          admin: false,
        };

        await request(app.getHttpServer()).post('/usuario').send(usuarioTemp);
      }

      const resp = await request(app.getHttpServer()).get('/usuario/1/10');

      expect(resp.status).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(10);
    });

    it('obter todos os registros da página 2', async () => {
      const resp = await request(app.getHttpServer()).get('/usuario/999/10');

      expect(resp.status).toBeDefined();
      expect(resp.body.message).toBe(null);
      expect(resp.body.data.length).toBe(0);
    });
  });
});
