import { IsEmail, IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreateRecuperacaoSenhaDto {
  @IsEmail({}, { message: `email ${EMensagem.NAO_VALIDO}` })
  @IsNotEmpty({ message: `email ${EMensagem.NAO_PODE_SER_VAZIO}` })
  email: string;
}
