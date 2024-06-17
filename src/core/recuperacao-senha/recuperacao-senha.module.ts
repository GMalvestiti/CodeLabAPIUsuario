import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioPermissao } from '../usuario/entities/usuario-permissao.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { RecuperacaoSenha } from './entities/recuperacao-senha.entity';
import { RecuperacaoSenhaController } from './recuperacao-senha.controller';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';
import { RqmClientService } from 'src/shared/services/rqm-client.service';
import { ClientProxy, Closeable } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioPermissao, RecuperacaoSenha]),
  ],
  controllers: [RecuperacaoSenhaController],
  providers: [
    RecuperacaoSenhaService,
    {
      provide: 'MAIL_SERVICE',
      useFactory: async (
        rmqClientService: RqmClientService,
      ): Promise<ClientProxy & Closeable> => {
        return rmqClientService.createRabbitMQOptions('mail.enviar-email');
      },
      inject: [RqmClientService],
    },
    RqmClientService,
  ],
})
export class RecuperacaoSenhaModule {}
