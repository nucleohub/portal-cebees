import PDFDocument from 'pdfkit';

export interface ContratoPdfInput {
  numero: string;
  professor: { nomeCompleto: string; cpf: string; email: string };
  turma: { codigo: string; nome: string; dataInicio: string; dataFim: string; cargaHoraria: number };
  valorHora: number;
  valorTotal: number;
  emissao: Date;
  empresa: { razaoSocial: string; cnpj: string; endereco: string };
}

/**
 * Render a professor contract to a PDF Buffer using pdfkit.
 * Layout is intentionally simple — real templates can be swapped in later
 * (e.g. docx → pdf pipeline) without touching callers.
 */
export function renderContratoPdf(input: ContratoPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS DOCENTES', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text(`Nº ${input.numero}`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(1);

    doc.fontSize(11).text('CONTRATANTE', { underline: true });
    doc.fontSize(10).text(input.empresa.razaoSocial);
    doc.text(`CNPJ: ${input.empresa.cnpj}`);
    doc.text(input.empresa.endereco);
    doc.moveDown(0.8);

    doc.fontSize(11).text('CONTRATADO', { underline: true });
    doc.fontSize(10).text(input.professor.nomeCompleto);
    doc.text(`CPF: ${maskCpf(input.professor.cpf)}`);
    doc.text(`Email: ${input.professor.email}`);
    doc.moveDown(0.8);

    doc.fontSize(11).text('OBJETO', { underline: true });
    doc
      .fontSize(10)
      .text(
        `Prestação de serviços docentes para a turma ${input.turma.codigo} — ${input.turma.nome}, ` +
          `com carga horária total de ${input.turma.cargaHoraria}h, período de ${fmtDate(input.turma.dataInicio)} a ${fmtDate(input.turma.dataFim)}.`,
        { align: 'justify' },
      );
    doc.moveDown(0.8);

    doc.fontSize(11).text('REMUNERAÇÃO', { underline: true });
    doc
      .fontSize(10)
      .text(
        `Valor/hora: ${brl(input.valorHora)} — Valor total bruto: ${brl(input.valorTotal)}. ` +
          'Pagamento mensal conforme horas efetivamente ministradas.',
        { align: 'justify' },
      );
    doc.moveDown(0.8);

    doc.fontSize(11).text('CLÁUSULAS GERAIS', { underline: true });
    doc
      .fontSize(10)
      .list(
        [
          'Sigilo sobre dados acadêmicos e administrativos.',
          'Cumprimento do plano de ensino aprovado pela Coordenação.',
          'Rescisão unilateral mediante aviso prévio de 15 dias.',
          'Vigência conforme datas da turma descritas no objeto.',
        ],
        { bulletRadius: 2 },
      );
    doc.moveDown(1.5);

    doc.fontSize(10).text(`Emitido em ${input.emissao.toLocaleDateString('pt-BR')}.`);
    doc.moveDown(3);

    const y = doc.y;
    doc.text('_________________________________________', 50, y);
    doc.text(input.empresa.razaoSocial, 50, y + 15);
    doc.text('_________________________________________', 320, y);
    doc.text(input.professor.nomeCompleto, 320, y + 15);

    doc.end();
  });
}

function brl(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
}

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
