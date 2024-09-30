import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IResponse } from '../../shared/interfaces/response.interface';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a success response on valid login', async () => {
      const loginDto: LoginDto = {
        email: 'test@gmail.com',
        senha: 'senha',
      };
      const expectedResponse: IResponse<string> = new HttpResponse<string>(
        'token',
      ).onSuccess(EMensagem.AUTENTICADO_SUCESSO);

      jest.spyOn(authService, 'login').mockResolvedValue('token');

      const result = await authController.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an error if login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@gmail.com',
        senha: 'senhaerrada',
      };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
