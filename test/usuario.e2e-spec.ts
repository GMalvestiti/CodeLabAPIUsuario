import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AlterarSenhaUsuarioDto } from '../src/core/usuario/dto/alterar-senha-usuario.dto';
import { CreateUsuarioDto } from '../src/core/usuario/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../src/core/usuario/dto/update-usuario.dto';
import { UsuarioService } from '../src/core/usuario/usuario.service';
import { IFindAllOrder } from '../src/shared/interfaces/find-all-order.interface';
import { IFindAllFilter } from '../src/shared/interfaces/find-all-filter.interface';
import { UsuarioController } from '../src/core/usuario/usuario.controller';
import { EMensagem } from '../src/shared/enums/mensagem.enum';

describe('UsuarioController (e2e)', () => {
  let controller: UsuarioController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: UsuarioService;

  const mockUsuarioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    alterarSenha: jest.fn(),
    unactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get<UsuarioService>(UsuarioService);
  });

  it('should create a user', async () => {
    const createUsuarioDto: CreateUsuarioDto = {
      nome: 'John Doe',
      email: 'john@example.com',
      senha: 'password',
      ativo: true,
      admin: false,
      permissao: [],
    };

    const expectedResponse = { id: 1, ...createUsuarioDto };
    mockUsuarioService.create.mockResolvedValue(expectedResponse);

    await controller.create(createUsuarioDto);
    expect(mockUsuarioService.create).toHaveBeenCalled();
  });

  it('should find all users', async () => {
    const page = 0;
    const size = 10;
    const order: IFindAllOrder = { column: 'id', sort: 'asc' };
    const filter: IFindAllFilter = { column: 'id', value: 1 };

    const expectedResponse = { data: [], count: 0 };
    mockUsuarioService.findAll.mockResolvedValue(expectedResponse);

    const result = await controller.findAll(page, size, order, filter);
    expect(result).toEqual(expectedResponse);
    expect(mockUsuarioService.findAll).toHaveBeenCalled();
  });

  it('should find a user by id', async () => {
    const id = 1;
    const expectedResponse = {
      id,
      nome: 'John Doe',
      email: 'john@example.com',
    };
    mockUsuarioService.findOne.mockResolvedValue(expectedResponse);

    const result = await controller.findOne(id);
    expect(result).toEqual({ data: expectedResponse });
    expect(mockUsuarioService.findOne).toHaveBeenCalled();
  });

  it('should update a user', async () => {
    const id = 1;
    const updateUsuarioDto: UpdateUsuarioDto = {
      id,
      nome: 'John Doe',
      email: 'john@example.com',
      senha: 'newPassword',
      ativo: true,
      admin: false,
      permissao: [],
    };
    const expectedResponse = { id, ...updateUsuarioDto };
    mockUsuarioService.update.mockResolvedValue(expectedResponse);

    await controller.update(id, updateUsuarioDto);
    expect(mockUsuarioService.update).toHaveBeenCalled();
  });

  it('should change user password', async () => {
    const alterarSenhaDto: AlterarSenhaUsuarioDto = {
      email: 'john@example.com',
      senha: 'newPassword',
      token: '123456',
    };
    mockUsuarioService.alterarSenha.mockResolvedValue(true);

    await controller.alterarSenha(alterarSenhaDto);
    expect(mockUsuarioService.alterarSenha).toHaveBeenCalled();
  });

  it('should deactivate a user', async () => {
    const id = 1;
    mockUsuarioService.unactivate.mockResolvedValue(true);

    const result = await controller.unactivate(id);
    expect(result).toEqual({
      data: true,
      message: EMensagem.DESATIVADO_SUCESSO,
      count: undefined,
    });
    expect(mockUsuarioService.unactivate).toHaveBeenCalled();
  });

  it('should throw error if user not found', async () => {
    const id = 1;
    mockUsuarioService.findOne.mockRejectedValue(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );

    await expect(controller.findOne(id)).rejects.toThrow(HttpException);
  });
});
