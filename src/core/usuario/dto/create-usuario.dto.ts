import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';
import { CreateUsuarioPermissaoDto } from './create-usuario-permissao.dto';
import { UpdateUsuarioPermissaoDto } from './update-usuario-permissao.dto';

export class CreateUsuarioDto {
  // Sem id devido ao whitelist do ValidationPipe
  @IsNotEmpty({ message: `nome ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @MaxLength(60, { message: `nome ${EMensagem.MAIS_CARACTERES_QUE_PERMITIDO}` })
  nome: string;

  @IsNotEmpty({ message: `email ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @IsEmail({}, { message: `email ${EMensagem.NAO_VALIDO}` })
  email: string;

  @IsNotEmpty({ message: `senha ${EMensagem.NAO_PODE_SER_VAZIO}` })
  senha: string;

  @IsNotEmpty({ message: `ativo ${EMensagem.NAO_PODE_SER_VAZIO}` })
  ativo: boolean;

  @IsNotEmpty({ message: `admin ${EMensagem.NAO_PODE_SER_VAZIO}` })
  admin: boolean;

  @IsArray({ message: `permissão ${EMensagem.TIPO_INVALIDO}` })
  @Type(() => CreateUsuarioPermissaoDto)
  permissao: CreateUsuarioPermissaoDto[] | UpdateUsuarioPermissaoDto[];
}
