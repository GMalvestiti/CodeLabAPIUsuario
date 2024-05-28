import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HttpResponse } from '../../shared/classes/http-response';
import { IFindAllFilter } from '../../shared/interfaces/find-all-filter.interface';
import { IFindAllOrder } from '../../shared/interfaces/find-all-order.interface';
import { IResponse } from '../../shared/interfaces/response.interface';
import { ParseFindAllFilterPipe } from '../../shared/pipes/parse-find-all-filter.pipe';
import { ParseFindAllOrderPipe } from '../../shared/pipes/parse-find-all-order.pipe';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<IResponse<Usuario>> {
    const data = await this.usuarioService.create(createUsuarioDto);

    return new HttpResponse<Usuario>(data).onCreated();
  }

  @Get(':page/:size/:order')
  async findAll(
    @Param('page') page: number,
    @Param('size') size: number,
    @Param('order', ParseFindAllOrderPipe) order: IFindAllOrder,
    @Query('filter', ParseFindAllFilterPipe)
    filter: IFindAllFilter | IFindAllFilter[],
  ): Promise<IResponse<Usuario[]>> {
    const data = await this.usuarioService.findAll(page, size, order, filter);

    return new HttpResponse<Usuario[]>(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IResponse<Usuario>> {
    const data = await this.usuarioService.findOne(id);

    return new HttpResponse<Usuario>(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<IResponse<Usuario>> {
    const data = await this.usuarioService.update(id, updateUsuarioDto);

    return new HttpResponse<Usuario>(data).onUpdate();
  }

  @Patch(':email/:token')
  async alterarSenha(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<IResponse<Usuario>> {
    const data = await this.usuarioService.update(id, updateUsuarioDto);

    return new HttpResponse<Usuario>(data).onUpdate();
  }

  @Delete(':id')
  async unactivate(@Param('id') id: number): Promise<IResponse<boolean>> {
    const data = await this.usuarioService.unactivate(id);

    return new HttpResponse<boolean>(data).onUnactivated();
  }
}
