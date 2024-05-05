import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EMensagem } from 'src/shared/enums/mensagem.enum';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
  @InjectRepository(Usuario)
  private repository: Repository<Usuario>;

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const finded = await this.repository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (finded) {
      throw new HttpException(
        EMensagem.IMPOSSIVEL_CADASTRAR,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const created = this.repository.create(createUsuarioDto);

    return await this.repository.save(created);
  }

  async findAll(page: number, size: number): Promise<Usuario[]> {
    page--;

    return await this.repository.find({
      loadEagerRelations: false,
      skip: page * size || 0,
      take: size || 10,
    });
  }

  async findOne(id: number): Promise<Usuario> {
    return await this.repository.findOne({
      where: { id: id },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    if (id !== updateUsuarioDto.id) {
      throw new HttpException(
        EMensagem.IDS_DIFERENTES,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const finded = await this.repository.findOne({
      select: ['id'],
      where: { email: updateUsuarioDto.email },
    });

    if (finded && finded.id !== id) {
      throw new HttpException(
        EMensagem.IMPOSSIVEL_ALTERAR,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return await this.repository.save(updateUsuarioDto);
  }

  async unactivate(id: number): Promise<boolean> {
    const finded = await this.repository.findOne({
      where: { id: id },
    });

    if (!finded) {
      throw new HttpException(
        EMensagem.IMPOSSIVEL_DESATIVAR,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    finded.ativo = false;

    return (await this.repository.save(finded)).ativo;
  }
}
