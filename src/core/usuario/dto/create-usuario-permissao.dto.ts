import { IsInt, IsNotEmpty } from 'class-validator';
import { EMensagem } from '../../../shared/enums/mensagem.enum';

export class CreateUsuarioPermissaoDto {
  @IsNotEmpty({ message: `modulo ${EMensagem.NAO_PODE_SER_VAZIO}` })
  @IsInt()
  modulo: number;
}
