import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioPermissao } from '../usuario/entities/usuario-permissao.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { RecuperacaoSenha } from './entities/recuperacao-senha.entity';
import { RecuperacaoSenhaController } from './recuperacao-senha.controller';
import { RecuperacaoSenhaService } from './recuperacao-senha.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioPermissao, RecuperacaoSenha]),
  ],
  controllers: [RecuperacaoSenhaController],
  providers: [RecuperacaoSenhaService],
})
export class RecuperacaoSenhaModule {}
