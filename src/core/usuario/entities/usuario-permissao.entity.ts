import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('usuariopermissao')
export class UsuarioPermissao {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_usuariopermissao' })
  id: number;

  @Column({ nullable: false, name: 'id_usuario' })
  idUsuario: number;

  @Column({ nullable: false, name: 'id_modulo' })
  idModulo: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.id)
  @JoinColumn({
    name: 'id_usuario',
    foreignKeyConstraintName: 'fk_permissao_usuario',
  })
  usuario: Usuario;
}
