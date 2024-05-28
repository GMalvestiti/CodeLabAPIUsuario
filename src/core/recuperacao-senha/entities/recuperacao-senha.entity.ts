import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('recuperacaosenha')
export class RecuperacaoSenha {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk_recuperacao_senha',
  })
  id: string;

  @Column()
  email: string;

  @CreateDateColumn({ name: 'data_criacao' })
  dataCriacao: Date;
}
