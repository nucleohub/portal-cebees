import { Alocacao } from './Alocacao.js';
import { AuditLog } from './AuditLog.js';
import { ContratoProfessor } from './ContratoProfessor.js';
import { Disciplina, DisciplinaEspecialidade } from './Disciplina.js';
import { Disponibilidade } from './Disponibilidade.js';
import { Especialidade, ProfessorEspecialidade } from './Especialidade.js';
import { HistoricoAtuacao } from './HistoricoAtuacao.js';
import { Professor } from './Professor.js';
import { Projeto } from './Projeto.js';
import { Turma } from './Turma.js';
import { Usuario } from './Usuario.js';

Professor.belongsToMany(Especialidade, {
  through: ProfessorEspecialidade,
  foreignKey: 'professorId',
  otherKey: 'especialidadeId',
  as: 'especialidades',
});
Especialidade.belongsToMany(Professor, {
  through: ProfessorEspecialidade,
  foreignKey: 'especialidadeId',
  otherKey: 'professorId',
  as: 'professores',
});
ProfessorEspecialidade.belongsTo(Professor, { foreignKey: 'professorId', as: 'professor' });
ProfessorEspecialidade.belongsTo(Especialidade, {
  foreignKey: 'especialidadeId',
  as: 'especialidade',
});
Professor.hasMany(ProfessorEspecialidade, { foreignKey: 'professorId', as: 'professorEspecialidades' });
Especialidade.hasMany(ProfessorEspecialidade, { foreignKey: 'especialidadeId', as: 'professorEspecialidades' });

Professor.hasMany(Disponibilidade, { foreignKey: 'professorId', as: 'disponibilidades' });
Disponibilidade.belongsTo(Professor, { foreignKey: 'professorId', as: 'professor' });

Disciplina.belongsToMany(Especialidade, {
  through: DisciplinaEspecialidade,
  foreignKey: 'disciplinaId',
  otherKey: 'especialidadeId',
  as: 'especialidades',
});
Especialidade.belongsToMany(Disciplina, {
  through: DisciplinaEspecialidade,
  foreignKey: 'especialidadeId',
  otherKey: 'disciplinaId',
  as: 'disciplinas',
});

// Projeto self-reference (sub-ambiente → projeto pai)
Projeto.belongsTo(Projeto, { foreignKey: 'ambientePaiId', as: 'ambientePai' });
Projeto.hasMany(Projeto, { foreignKey: 'ambientePaiId', as: 'subAmbientes' });

// Projeto → Turma
Turma.belongsTo(Projeto, { foreignKey: 'projetoId', as: 'projeto' });
Projeto.hasMany(Turma, { foreignKey: 'projetoId', as: 'turmas' });

// Projeto → Alocacao (nullable — derived from turma at creation time)
Alocacao.belongsTo(Projeto, { foreignKey: 'projetoId', as: 'projeto' });
Projeto.hasMany(Alocacao, { foreignKey: 'projetoId', as: 'alocacoes' });

// Projeto → ContratoProfessor (nullable — derived from alocacao at creation time)
ContratoProfessor.belongsTo(Projeto, { foreignKey: 'projetoId', as: 'projeto' });
Projeto.hasMany(ContratoProfessor, { foreignKey: 'projetoId', as: 'contratos' });

Turma.belongsTo(Disciplina, { foreignKey: 'disciplinaId', as: 'disciplina' });
Disciplina.hasMany(Turma, { foreignKey: 'disciplinaId', as: 'turmas' });

Turma.hasMany(Alocacao, { foreignKey: 'turmaId', as: 'alocacoes' });
Alocacao.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });
Professor.hasMany(Alocacao, { foreignKey: 'professorId', as: 'alocacoes' });
Alocacao.belongsTo(Professor, { foreignKey: 'professorId', as: 'professor' });

Alocacao.hasOne(ContratoProfessor, { foreignKey: 'alocacaoId', as: 'contrato' });
ContratoProfessor.belongsTo(Alocacao, { foreignKey: 'alocacaoId', as: 'alocacao' });
Professor.hasMany(ContratoProfessor, { foreignKey: 'professorId', as: 'contratos' });
ContratoProfessor.belongsTo(Professor, { foreignKey: 'professorId', as: 'professor' });

Professor.hasMany(HistoricoAtuacao, { foreignKey: 'professorId', as: 'historicos' });
HistoricoAtuacao.belongsTo(Professor, { foreignKey: 'professorId', as: 'professor' });
Turma.hasMany(HistoricoAtuacao, { foreignKey: 'turmaId', as: 'historicos' });
HistoricoAtuacao.belongsTo(Turma, { foreignKey: 'turmaId', as: 'turma' });
Alocacao.hasOne(HistoricoAtuacao, { foreignKey: 'alocacaoId', as: 'historico' });
HistoricoAtuacao.belongsTo(Alocacao, { foreignKey: 'alocacaoId', as: 'alocacao' });

Usuario.belongsTo(Professor, { foreignKey: 'professorId', as: 'professor' });
Professor.hasOne(Usuario, { foreignKey: 'professorId', as: 'usuario' });

export {
  Alocacao,
  AuditLog,
  ContratoProfessor,
  Disciplina,
  DisciplinaEspecialidade,
  Disponibilidade,
  Especialidade,
  HistoricoAtuacao,
  Professor,
  ProfessorEspecialidade,
  Projeto,
  Turma,
  Usuario,
};
