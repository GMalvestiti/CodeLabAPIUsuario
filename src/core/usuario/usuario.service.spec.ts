import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: Repository<Usuario>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('criar um novo usuário', async () => {
      const createUsuarioDto = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuario = Object.assign(createUsuarioDto, { id: 1 });

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(Promise.resolve(mockUsuario));

      const response = await service.create(createUsuarioDto);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lançar uma exceção ao repetir um email já cadastrado, quando criar um novo usuário', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(Promise.resolve(mockUsuario));

      try {
        await service.create(mockUsuario);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.IMPOSSIVEL_CADASTRAR);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('findAll', () => {
    it('obter uma listagem de usuários', async () => {
      const mockUsuarioLista = [
        {
          id: 1,
          nome: 'Teste',
          email: 'teste@teste.com',
          senha: '123456',
          ativo: true,
          admin: false,
          permissao: [],
        },
      ];

      const spyRepositoryFind = jest
        .spyOn(repository, 'find')
        .mockResolvedValue(Promise.resolve(mockUsuarioLista));

      const response = await service.findAll(1, 10);

      expect(response).toEqual(mockUsuarioLista);
      expect(spyRepositoryFind).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('obter um usuário', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(Promise.resolve(mockUsuario));

      const response = await service.findOne(1);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('alterar um usuário', async () => {
      const updateUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuario = Object.assign(updateUsuarioDto, {});

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(Promise.resolve(mockUsuario));

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(Promise.resolve(mockUsuario));

      const response = await service.update(1, updateUsuarioDto);

      expect(response).toEqual(mockUsuario);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lança uma exceção ao enviar ids diferentes quando alterar um usuário', async () => {
      const updateUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      try {
        await service.update(999, updateUsuarioDto);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.IDS_DIFERENTES);
      }
    });

    it('lança uma exceção ao enviar um email previamente cadastrado quando alterar um usuário', async () => {
      const createUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuarioFindOne = {
        id: 2,
        nome: 'Teste2',
        email: 'teste2@teste.com',
        senha: 'abcdef',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(Promise.resolve(mockUsuarioFindOne));

      try {
        await service.update(1, createUsuarioDto);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.IMPOSSIVEL_ALTERAR);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });

  describe('unactivate', () => {
    it('desativa um usuário', async () => {
      const createUsuarioDto = {
        id: 1,
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        ativo: true,
        admin: false,
        permissao: [],
      };

      const mockUsuario = Object.assign(createUsuarioDto, { ativo: false });

      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(Promise.resolve(createUsuarioDto));

      const spyRepositorySave = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(Promise.resolve(mockUsuario));

      const response = await service.unactivate(1);

      expect(response).toBe(false);
      expect(spyRepositoryFindOne).toHaveBeenCalled();
      expect(spyRepositorySave).toHaveBeenCalled();
    });

    it('lança uma exceção caso não encontrar o usuário', async () => {
      const spyRepositoryFindOne = jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(Promise.resolve(null));

      try {
        await service.unactivate(1);
      } catch (error: any) {
        expect(error.message).toBe(EMensagem.IMPOSSIVEL_DESATIVAR);
        expect(error.status).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(spyRepositoryFindOne).toHaveBeenCalled();
      }
    });
  });
});
