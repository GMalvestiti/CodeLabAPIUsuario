import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  IKongJWTConsumer,
  IKongJWTCredential,
} from './interfaces/kong-consumer-jwt.interface';
import { EMensagem } from '../../shared/enums/mensagem.enum';

@Injectable()
export class KongService {
  private readonly logger = new Logger(KongService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async getCredential(): Promise<IKongJWTCredential> {
    try {
      const kongHost = this.configService.get<string>('KONG_URL');
      const kongConsumer = this.configService.get<string>('KONG_CONSUMER');

      const resp = (
        await firstValueFrom(
          this.httpService.get<IKongJWTConsumer>(
            `${kongHost}/consumers/${kongConsumer}/jwt`,
          ),
        )
      ).data;

      return resp.data[0];
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(
        EMensagem.NAO_FOI_POSSIVEL_OBTER_CREDENCIAL,
      );
    }
  }
}
