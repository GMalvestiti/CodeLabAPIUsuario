import { Test, TestingModule } from '@nestjs/testing';
import { RecuperacaoSenhaController } from './recuperacao-senha.controller';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';
import { CreateRecuperacaoSenhaDto } from './dto/create-recuperacao-senha.dto';
import { HttpResponse } from '../../shared/classes/http-response';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { IResponse } from '../../shared/interfaces/response.interface';

describe('RecuperacaoSenhaController', () => {
  let controller: RecuperacaoSenhaController;
  let service: RecuperacaoSenhaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecuperacaoSenhaController],
      providers: [
        {
          provide: RecuperacaoSenhaService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecuperacaoSenhaController>(
      RecuperacaoSenhaController,
    );
    service = module.get<RecuperacaoSenhaService>(RecuperacaoSenhaService);
  });

  describe('create', () => {
    it('should call the password recovery service with the correct DTO and return a success response', async () => {
      const createRecuperacaoSenhaDto: CreateRecuperacaoSenhaDto = {
        email: 'test@gmail.com',
      };
      const response: IResponse<boolean> = new HttpResponse<boolean>(
        true,
      ).onSuccess(EMensagem.VERIFIQUE_ENDERECO_EMAIL_INFORMADO);

      jest.spyOn(service, 'create').mockResolvedValue(undefined);

      const result = await controller.create(createRecuperacaoSenhaDto);

      expect(service.create).toHaveBeenCalledWith(createRecuperacaoSenhaDto);
      expect(result).toEqual(response);
    });
  });
});
