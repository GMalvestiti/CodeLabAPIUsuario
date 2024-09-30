jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { KongService } from './kong.service';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { EMensagem } from '../../shared/enums/mensagem.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: Repository<Usuario>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let kongService: KongService;

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        KongService,
        {
          provide: getRepositoryToken(Usuario),
          useClass: Repository,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of({ data: {} })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioRepository = module.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    kongService = module.get<KongService>(KongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw an exception if user is not found', async () => {
      jest.spyOn(usuarioRepository, 'findOne').mockResolvedValue(null);

      const loginDto: LoginDto = { email: 'test@test.com', senha: 'password' };

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException(
          EMensagem.USUARIO_SENHA_INVALIDOS,
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw an exception if password does not match', async () => {
      const user = {
        id: 1,
        senha: 'hashedPassword',
        email: 'test@test.com',
        nome: 'Test',
        admin: false,
        permissao: [],
      };
      jest
        .spyOn(usuarioRepository, 'findOne')
        .mockResolvedValue(user as Usuario);
      jest
        .spyOn(usuarioRepository, 'findOne')
        .mockResolvedValue(user as Usuario);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      const loginDto: LoginDto = {
        email: 'test@test.com',
        senha: 'wrongPassword',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        new HttpException(
          EMensagem.USUARIO_SENHA_INVALIDOS,
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should return a JWT token if login is successful', async () => {
      const user = {
        id: 1,
        senha: 'hashedPassword',
        email: 'test@test.com',
        nome: 'Test',
        admin: false,
        permissao: [],
      };
      jest
        .spyOn(usuarioRepository, 'findOne')
        .mockResolvedValue(user as Usuario);
      jest
        .spyOn(usuarioRepository, 'findOne')
        .mockResolvedValue(user as Usuario);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      jest
        .spyOn(kongService, 'getCredential')
        .mockResolvedValue({ id: 'kongId', key: 'kongKey' });
      jest.spyOn(configService, 'get').mockReturnValue('3600s');
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      const loginDto: LoginDto = { email: 'test@test.com', senha: 'password' };

      const result = await service.login(loginDto);

      expect(result).toBe('jwtToken');
    });
  });
});
