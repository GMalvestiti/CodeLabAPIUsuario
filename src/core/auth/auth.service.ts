import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { EMensagem } from '../../shared/enums/mensagem.enum';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { KongService } from './kong.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  @InjectRepository(Usuario)
  private usuarioRepository: Repository<Usuario>;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private kongService: KongService,
  ) {}

  async login(loginDto: LoginDto): Promise<string> {
    const finded = await this.usuarioRepository.findOne({
      select: ['id', 'senha', 'email', 'nome', 'admin'],
      where: { email: loginDto.email },
    });

    const matchPassword = bcrypt.compareSync(loginDto.senha, finded.senha);

    if (!finded || !matchPassword) {
      throw new HttpException(
        EMensagem.USUARIO_SENHA_INVALIDOS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    delete finded.senha;

    const kongCredential = this.kongService.getCredential();

    const expiresIn: string = this.configService.get('JWT_TOKEN_EXPIRES_IN');

    const payload: JwtPayload = {
      id: finded.id,
      email: finded.email,
      nome: finded.nome,
      admin: finded.admin,
      modulos: finded.permissao.map((p) => p.modulo),
    };

    const jwtToken = this.jwtService.sign(payload, {
      algorithm: 'HS256',
      issuer: (await kongCredential).key,
      expiresIn,
    });

    return jwtToken;
  }
}
