import { IsEmail, IsEmpty, IsNotEmpty, MaxLength } from 'class-validator';
import { EMensagem } from 'src/shared/enums/mensagem.enum';

export class CreateUsuarioDto {
  @IsEmpty({ message: `id ${EMensagem.DEVE_SER_VAZIO}` }) // Nunca deve ser preenchido
  id: number;

  @IsNotEmpty({ message: `nome ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @MaxLength(60, { message: `nome ${EMensagem.MAIS_CARACTERES_QUE_PERMITIDO}` })
  nome: string;

  @IsNotEmpty({ message: `nome ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @IsEmail({}, { message: `email ${EMensagem.NAO_VALIDO}` })
  email: string;

  @IsNotEmpty({ message: `senha ${EMensagem.NAO_PODE_SER_VAZIO}` })
  senha: string;

  @IsNotEmpty({ message: `ativo ${EMensagem.NAO_PODE_SER_VAZIO}` })
  ativo: boolean;

  @IsNotEmpty({ message: `admin ${EMensagem.NAO_PODE_SER_VAZIO}` })
  admin: boolean;
}
