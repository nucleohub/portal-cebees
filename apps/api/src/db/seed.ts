import bcrypt from 'bcrypt';

import { Papel, ProfessorStatus, TipoCurso, TurmaStatus } from '@cebees/shared-types';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

import {
  Disciplina,
  DisciplinaEspecialidade,
  Disponibilidade,
  Especialidade,
  Professor,
  ProfessorEspecialidade,
  Projeto,
  Turma,
  Usuario,
} from './models/index.js';
import { sequelize } from './sequelize.js';

async function seed(): Promise<void> {
  await sequelize.authenticate();
  logger.info('Seeding database...');

  const [seguranca, primeirosSocorros, didatica, combateIncendio, legislacao] = await Promise.all([
    Especialidade.create({
      nome: 'Segurança do Trabalho',
      area: 'Segurança',
      descricao: 'NR-5, NR-6, NR-10, CIPA',
    }),
    Especialidade.create({
      nome: 'Primeiros Socorros',
      area: 'Saúde',
      descricao: 'Atendimento pré-hospitalar',
    }),
    Especialidade.create({
      nome: 'Didática e Metodologia',
      area: 'Educação',
      descricao: 'Técnicas pedagógicas',
    }),
    Especialidade.create({
      nome: 'Combate a Incêndio',
      area: 'Bombeiros',
      descricao: 'Técnicas operacionais CBMF',
    }),
    Especialidade.create({
      nome: 'Legislação de SST',
      area: 'Jurídico',
      descricao: 'Normas regulamentadoras',
    }),
  ]);

  const [nr10, cipa, bombeirosCivil] = await Promise.all([
    Disciplina.create({
      codigo: 'NR10-BASICO',
      nome: 'NR-10 — Segurança em Instalações Elétricas (Básico)',
      ementa: 'Riscos elétricos, proteção coletiva e individual, primeiros socorros.',
      cargaHoraria: 40,
    }),
    Disciplina.create({
      codigo: 'CIPA-01',
      nome: 'Curso CIPA — Comissão Interna de Prevenção de Acidentes',
      ementa: 'Estudo das NRs, investigação de acidentes, SIPAT.',
      cargaHoraria: 20,
    }),
    Disciplina.create({
      codigo: 'BC-FORM',
      nome: 'Formação de Bombeiro Civil',
      ementa: 'Combate a incêndio, resgate, primeiros socorros.',
      cargaHoraria: 160,
    }),
  ]);

  await Promise.all([
    DisciplinaEspecialidade.create({
      disciplinaId: nr10.id,
      especialidadeId: seguranca.id,
      peso: 1.0,
    }),
    DisciplinaEspecialidade.create({
      disciplinaId: nr10.id,
      especialidadeId: legislacao.id,
      peso: 0.6,
    }),
    DisciplinaEspecialidade.create({
      disciplinaId: cipa.id,
      especialidadeId: seguranca.id,
      peso: 1.0,
    }),
    DisciplinaEspecialidade.create({
      disciplinaId: cipa.id,
      especialidadeId: didatica.id,
      peso: 0.4,
    }),
    DisciplinaEspecialidade.create({
      disciplinaId: bombeirosCivil.id,
      especialidadeId: combateIncendio.id,
      peso: 1.0,
    }),
    DisciplinaEspecialidade.create({
      disciplinaId: bombeirosCivil.id,
      especialidadeId: primeirosSocorros.id,
      peso: 0.8,
    }),
  ]);

  const professoresSeed = [
    {
      nome: 'Ana Souza',
      cpf: '11111111111',
      rg: '111111',
      email: 'ana.souza@cebees.local',
      exp: 8,
      nivelSeg: 5,
      nivelDid: 4,
    },
    {
      nome: 'Bruno Lima',
      cpf: '22222222222',
      rg: '222222',
      email: 'bruno.lima@cebees.local',
      exp: 5,
      nivelSeg: 3,
      nivelDid: 3,
    },
    {
      nome: 'Carla Ribeiro',
      cpf: '33333333333',
      rg: '333333',
      email: 'carla.ribeiro@cebees.local',
      exp: 12,
      nivelSeg: 4,
      nivelDid: 5,
    },
    {
      nome: 'Diego Alves',
      cpf: '44444444444',
      rg: '444444',
      email: 'diego.alves@cebees.local',
      exp: 3,
      nivelSeg: 2,
      nivelDid: 2,
    },
    {
      nome: 'Eduarda Pinto',
      cpf: '55555555555',
      rg: '555555',
      email: 'eduarda.pinto@cebees.local',
      exp: 7,
      nivelSeg: 4,
      nivelDid: 4,
    },
  ];

  for (const p of professoresSeed) {
    const professor = Professor.build({
      nomeCompleto: p.nome,
      cpfEncrypted: '',
      cpfHash: '',
      rgEncrypted: '',
      email: p.email,
      dataNascimento: '1985-06-15',
      formacoes: [
        {
          nivel: 'GRADUACAO',
          curso: 'Engenharia de Segurança',
          instituicao: 'USP',
          anoConclusao: 2015,
        },
      ],
      experienciaAnos: p.exp,
      status: ProfessorStatus.ATIVO,
    });
    professor.cpf = p.cpf;
    professor.rg = p.rg;
    await professor.save();

    await ProfessorEspecialidade.create({
      professorId: professor.id,
      especialidadeId: seguranca.id,
      nivelProficiencia: p.nivelSeg,
      desdeAno: 2018,
    });
    await ProfessorEspecialidade.create({
      professorId: professor.id,
      especialidadeId: didatica.id,
      nivelProficiencia: p.nivelDid,
      desdeAno: 2019,
    });

    for (const dia of [1, 2, 3, 4, 5]) {
      await Disponibilidade.create({
        professorId: professor.id,
        diaSemana: dia,
        periodo: 'MANHA',
        horaInicio: '08:00:00',
        horaFim: '12:00:00',
      });
    }
  }

  // Resolve project IDs — created by migration 013
  const [projCursosLivres, projCbmf] = await Promise.all([
    Projeto.findOne({ where: { codigo: 'CURSOS_LIVRES' } }),
    Projeto.findOne({ where: { codigo: 'CBMF' } }),
  ]);

  if (!projCursosLivres || !projCbmf) {
    throw new Error('Projetos bootstrap não encontrados. Execute as migrations primeiro.');
  }

  await Turma.create({
    codigo: 'NR10-2026-001',
    nome: 'NR-10 Turma 001/2026',
    projetoId: projCursosLivres.id,
    disciplinaId: nr10.id,
    tipoCurso: TipoCurso.FORMACAO_PROFISSIONAL,
    cargaHorariaTotal: 40,
    dataInicio: '2026-06-01',
    dataFim: '2026-06-30',
    horarios: [
      { diaSemana: 2, periodo: 'MANHA', horaInicio: '08:00', horaFim: '12:00' },
      { diaSemana: 4, periodo: 'MANHA', horaInicio: '08:00', horaFim: '12:00' },
    ],
    vagas: 30,
    status: TurmaStatus.PLANEJADA,
  });

  await Turma.create({
    codigo: 'BC-2026-001',
    nome: 'Bombeiro Civil 001/2026',
    projetoId: projCbmf.id,
    disciplinaId: bombeirosCivil.id,
    tipoCurso: TipoCurso.CBMF,
    cargaHorariaTotal: 160,
    dataInicio: '2026-05-01',
    dataFim: '2026-08-30',
    horarios: [
      { diaSemana: 6, periodo: 'MANHA', horaInicio: '08:00', horaFim: '12:00' },
      { diaSemana: 6, periodo: 'TARDE', horaInicio: '13:00', horaFim: '17:00' },
    ],
    vagas: 25,
    status: TurmaStatus.PLANEJADA,
  });

  const senhaPadrao = await bcrypt.hash('Cebees@2026', env.bcryptRounds);
  await Usuario.bulkCreate([
    {
      email: 'admin@cebees.local',
      nome: 'Administrador',
      senhaHash: senhaPadrao,
      papel: Papel.ADMIN,
      professorId: null,
    },
    {
      email: 'coordenador@cebees.local',
      nome: 'Coordenador Demo',
      senhaHash: senhaPadrao,
      papel: Papel.COORDENADOR,
      professorId: null,
    },
    {
      email: 'secretaria@cebees.local',
      nome: 'Secretaria Demo',
      senhaHash: senhaPadrao,
      papel: Papel.SECRETARIA,
      professorId: null,
    },
  ]);

  const ana = await Professor.findOne({ where: { email: 'ana.souza@cebees.local' } });
  if (ana) {
    await Usuario.create({
      email: 'professor.ana@cebees.local',
      nome: ana.nomeCompleto,
      senhaHash: senhaPadrao,
      papel: Papel.PROFESSOR,
      professorId: ana.id,
    });
  }

  logger.info('Seed complete.');
}

seed()
  .then(() => sequelize.close())
  .catch((err) => {
    logger.error({ err }, 'Seed failed');
    return sequelize.close().finally(() => process.exit(1));
  });
