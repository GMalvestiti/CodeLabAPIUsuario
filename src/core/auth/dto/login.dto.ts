import { IsEmail, IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class LoginDto {
  @IsEmail({}, { message: `email ${EMensagem.NAO_VALIDO}` })
  @IsNotEmpty({ message: `email ${EMensagem.NAO_PODE_SER_VAZIO}` })
  email: string;

  @IsNotEmpty({ message: `senha ${EMensagem.NAO_PODE_SER_VAZIO}` })
  senha: string;
}
