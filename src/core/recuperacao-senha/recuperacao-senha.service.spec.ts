import { Test, TestingModule } from '@nestjs/testing';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateRecuperacaoSenhaDto } from './dto/create-recuperacao-senha.dto';
import { RecuperacaoSenha } from './entities/recuperacao-senha.entity';
import { UpdateUsuarioDto } from '../usuario/dto/update-usuario.dto';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { AlterarSenhaUsuarioDto } from '../usuario/dto/alterar-senha-usuario.dto';

const mockCreateUsuarioDto: CreateUsuarioDto = {
  nome: 'Usuario de Teste',
  email: 'teste@exemplo.com',
  senha: 'senha123',
  ativo: true,
  admin: false,
  permissao: [{ modulo: 1 }],
};

const mockUpdateUsuarioDto: UpdateUsuarioDto = Object.assign(
  mockCreateUsuarioDto,
  { id: 1 },
);

const mockUsuario: Usuario = new Usuario(mockUpdateUsuarioDto);

const mockAlterarSenha: AlterarSenhaUsuarioDto = {
  email: mockUsuario.email,
  senha: 'novaSenha',
  token: '123456',
};

const mockRecuperarSenha: RecuperacaoSenha = {
  id: mockAlterarSenha.token,
  email: mockAlterarSenha.email,
  dataCriacao: new Date(),
};

describe('RecuperacaoSenhaService', () => {
  let service: RecuperacaoSenhaService;
  let usuarioRepository: Repository<Usuario>;
  let recuperacaoSenhaRepository: Repository<RecuperacaoSenha>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mailService: ClientProxy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecuperacaoSenhaService,
        {
          provide: getRepositoryToken(RecuperacaoSenha),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useClass: Repository,
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000/'),
          },
        },
      ],
    }).compile();

    service = module.get<RecuperacaoSenhaService>(RecuperacaoSenhaService);
    usuarioRepository = module.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    recuperacaoSenhaRepository = module.get<Repository<RecuperacaoSenha>>(
      getRepositoryToken(RecuperacaoSenha),
    );
    mailService = module.get<ClientProxy>('MAIL_SERVICE');
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('create', () => {
    it('deve criar uma recuperação de senha e enviar um email se o usuário existir', async () => {
      const mockCreateRecuperarSenhaDto: CreateRecuperacaoSenhaDto = {
        email: mockRecuperarSenha.email,
      };

      const spyUsuarioRepository = jest
        .spyOn(usuarioRepository, 'findOne')
        .mockResolvedValue(mockUsuario as Usuario);
      const spyRecuperacaoSenhaRepositoryDelete = jest
        .spyOn(recuperacaoSenhaRepository, 'delete')
        .mockResolvedValue(undefined);
      const spyRecuperacaoSenhaRepositoryCreate = jest
        .spyOn(recuperacaoSenhaRepository, 'create')
        .mockReturnValue(mockCreateRecuperarSenhaDto as any);
      const spySecuperacaoSenhaRepositorySave = jest
        .spyOn(recuperacaoSenhaRepository, 'save')
        .mockResolvedValue(mockRecuperarSenha);
      jest
        .spyOn(configService, 'get')
        .mockReturnValue('http://localhost:3000/');

      await service.create(mockCreateRecuperarSenhaDto);

      expect(spyUsuarioRepository).toHaveBeenCalled();
      expect(spyRecuperacaoSenhaRepositoryDelete).toHaveBeenCalled();
      expect(spyRecuperacaoSenhaRepositoryCreate).toHaveBeenCalled();
      expect(spySecuperacaoSenhaRepositorySave).toHaveBeenCalled();
    });
  });
});
