import { Test, TestingModule } from '@nestjs/testing';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { AlterarSenhaUsuarioDto } from './dto/alterar-senha-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UsuarioController } from './usuario.controller';
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

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            alterarSenha: jest.fn(),
            unactivate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new usuario', async () => {
      const spyServiceCreate = jest
        .spyOn(service, 'create')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const response = await controller.create(mockCreateUsuarioDto);

      expect(response).toBeInstanceOf(HttpResponse);
      expect(response.message).toEqual(EMensagem.SALVO_SUCESSO);
      expect(response.data).toEqual(mockUsuario);
      expect(spyServiceCreate).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of usuarios', async () => {
      const mockListaUsuarios: Usuario[] = [mockUsuario];

      const spyServiceFindAll = jest.spyOn(service, 'findAll').mockReturnValue(
        Promise.resolve({
          data: mockListaUsuarios,
          count: mockListaUsuarios.length,
        }) as any,
      );

      const response = await controller.findAll(
        0,
        10,
        mockFindAllOrder,
        mockFindAllFilter,
      );

      expect(response.data).toEqual(mockListaUsuarios);
      expect(response.count).toEqual(mockListaUsuarios.length);
      expect(spyServiceFindAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a usuario', async () => {
      const spyServiceFindOne = jest
        .spyOn(service, 'findOne')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const response = await controller.findOne(1);

      expect(spyServiceFindOne).toHaveBeenCalled();
      expect(response.data).toEqual(mockUsuario);
    });
  });

  describe('update', () => {
    it('should update a usuario', async () => {
      const spyServiceUpdate = jest
        .spyOn(service, 'update')
        .mockReturnValue(Promise.resolve(mockUsuario) as any);

      const response = await controller.update(1, mockUpdateUsuarioDto);

      expect(spyServiceUpdate).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.ATUALIZADO_SUCESSO);
      expect(response.data).toEqual(mockUsuario);
    });
  });

  describe('alterarSenha', () => {
    const mockAlterarSenhaDto: AlterarSenhaUsuarioDto = {
      email: 'teste@exemplo.com',
      senha: 'novaSenha123',
      token: 'token123',
    };

    it('should change the password of a usuario', async () => {
      const spyServiceAlterarSenha = jest
        .spyOn(service, 'alterarSenha')
        .mockReturnValue(Promise.resolve(true) as any);

      const response = await controller.alterarSenha(mockAlterarSenhaDto);

      expect(spyServiceAlterarSenha).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.ATUALIZADO_SUCESSO);
      expect(response.data).toEqual(true);
    });
  });

  describe('unactivate', () => {
    it('should unactivate a usuario', async () => {
      const spyServiceUnactivate = jest
        .spyOn(service, 'unactivate')
        .mockReturnValue(Promise.resolve(true) as any);

      const response = await controller.unactivate(1);

      expect(spyServiceUnactivate).toHaveBeenCalled();
      expect(response.message).toEqual(EMensagem.DESATIVADO_SUCESSO);
      expect(response.data).toEqual(true);
    });
  });
});
