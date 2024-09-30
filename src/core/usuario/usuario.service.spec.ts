import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { RecuperacaoSenha } from '../recuperacao-senha/entities/recuperacao-senha.entity';
import { AlterarSenhaUsuarioDto } from './dto/alterar-senha-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioPermissao } from './entities/usuario-permissao.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';

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

const mockFindAllOrder: IFindAllOrder = {
  column: 'id',
  sort: 'asc',
};

const mockFindAllFilter: IFindAllFilter = {
  column: 'id',
  value: 1,
};

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

const senhaBcrypt =
  '$2a$10$feBRG3KNvWWNxhnmdgj0CeUtfgxuIs3sNR9agLQoRD570daP.jEy2';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: Repository<Usuario>;
  let repositoryRecuperacaoSenha: Repository<RecuperacaoSenha>;
  let repositoryUsuarioPermissao: Repository<UsuarioPermissao>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    } as unknown as Repository<Usuario>;

    repositoryRecuperacaoSenha = {
      findOne: jest.fn(),
      delete: jest.fn(),
    } as unknown as Repository<RecuperacaoSenha>;

    repositoryUsuarioPermissao = {
      delete: jest.fn(),
    } as unknown as Repository<UsuarioPermissao>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(RecuperacaoSenha),
          useValue: repositoryRecuperacaoSenha,
        },
        {
          provide: getRepositoryToken(UsuarioPermissao),
          useValue: repositoryUsuarioPermissao,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new usuario', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUsuario);
      const response = await service.create(mockCreateUsuarioDto);
      expect(response).toEqual(mockUsuario);
    });

    it('should throw an error when usuario already exists', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUsuario);
      await expect(service.create(mockCreateUsuarioDto)).rejects.toThrow(
        new HttpException(
          EMensagem.IMPOSSIVEL_CADASTRAR,
          HttpStatus.NOT_ACCEPTABLE,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of usuarios', async () => {
      const mockListaUsuarios = [mockUsuario];
      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([mockListaUsuarios, mockListaUsuarios.length]);
      const response = await service.findAll(
        0,
        10,
        mockFindAllOrder,
        mockFindAllFilter,
      );
      expect(response.data).toEqual(mockListaUsuarios);
      expect(response.count).toEqual(mockListaUsuarios.length);
    });
  });

  describe('findOne', () => {
    it('should return a usuario', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUsuario);
      const response = await service.findOne(mockUsuario.id);
      expect(response).toEqual(mockUsuario);
    });
  });

  describe('update', () => {
    it('should update a usuario', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUsuario);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUsuario);
      const response = await service.update(
        mockUpdateUsuarioDto.id,
        mockUpdateUsuarioDto,
      );
      expect(response).toEqual(
        Object.assign(mockUsuario, { senha: senhaBcrypt }),
      );
    });

    it('should throw an error when ids are different', async () => {
      await expect(service.update(2, mockUpdateUsuarioDto)).rejects.toThrow(
        new HttpException(EMensagem.IDS_DIFERENTES, HttpStatus.NOT_ACCEPTABLE),
      );
    });
  });

  describe('alterarSenha', () => {
    it('should alter the user password', async () => {
      jest
        .spyOn(repositoryRecuperacaoSenha, 'findOne')
        .mockResolvedValue(mockRecuperarSenha);
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUsuario);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUsuario);
      const result = await service.alterarSenha({
        email: mockUsuario.email,
        senha: mockAlterarSenha.senha,
        token: mockAlterarSenha.token,
      });
      expect(result).toBe(true);
    });

    it('should throw an error when the token is invalid', async () => {
      jest.spyOn(repositoryRecuperacaoSenha, 'findOne').mockResolvedValue(null);
      await expect(
        service.alterarSenha({
          email: mockUsuario.email,
          senha: mockAlterarSenha.senha,
          token: mockAlterarSenha.token,
        }),
      ).rejects.toThrow(
        new HttpException(
          EMensagem.IMPOSSIVEL_ALTERAR,
          HttpStatus.NOT_ACCEPTABLE,
        ),
      );
    });
  });

  describe('unactivate', () => {
    it('should unactivate a usuario', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUsuario);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(Object.assign(mockUsuario, { ativo: false }));
      const response = await service.unactivate(mockUsuario.id);
      expect(response).toBe(false);
    });

    it('should throw an error when usuario is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.unactivate(mockUsuario.id)).rejects.toThrow(
        new HttpException(
          EMensagem.IMPOSSIVEL_DESATIVAR,
          HttpStatus.NOT_ACCEPTABLE,
        ),
      );
    });
  });
});
