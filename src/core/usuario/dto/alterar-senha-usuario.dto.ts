import { IsEmail, IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class AlterarSenhaUsuarioDto {
  @IsNotEmpty({ message: `email ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @IsEmail({}, { message: `email ${EMensagem.NAO_VALIDO}` })
  email: string;

  @IsNotEmpty({ message: `senha ${EMensagem.NAO_PODE_SER_VAZIO}` })
  senha: string;

  @IsNotEmpty({ message: `token ${EMensagem.NAO_PODE_SER_VAZIO}` })
  token: string;
}
