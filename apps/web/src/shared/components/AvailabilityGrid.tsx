import { Box, Checkbox, Typography } from '@mui/material';
import type { DisponibilidadeDto } from '@cebees/shared-types';
import { DisponibilidadePeriodo } from '@cebees/shared-types';

const DIAS = [
  { num: 1, label: 'Seg' },
  { num: 2, label: 'Ter' },
  { num: 3, label: 'Qua' },
  { num: 4, label: 'Qui' },
  { num: 5, label: 'Sex' },
  { num: 6, label: 'Sáb' },
  { num: 7, label: 'Dom' },
];

const PERIODOS = [
  { value: DisponibilidadePeriodo.MANHA, label: 'Manhã', inicio: '07:00', fim: '12:00' },
  { value: DisponibilidadePeriodo.TARDE, label: 'Tarde', inicio: '13:00', fim: '18:00' },
  { value: DisponibilidadePeriodo.NOITE, label: 'Noite', inicio: '19:00', fim: '22:30' },
];

interface AvailabilityGridProps {
  disponibilidades: DisponibilidadeDto[];
  onChange?: (disponibilidades: DisponibilidadeDto[]) => void;
  professorId?: number;
  readOnly?: boolean;
}

export function AvailabilityGrid({
  disponibilidades,
  onChange,
  professorId = 0,
  readOnly = false,
}: AvailabilityGridProps) {
  const isChecked = (dia: number, periodo: string) =>
    disponibilidades.some((d) => d.diaSemana === dia && d.periodo === periodo);

  const toggle = (dia: number, periodo: (typeof PERIODOS)[number]) => {
    if (readOnly || !onChange) return;
    const exists = isChecked(dia, periodo.value);
    if (exists) {
      onChange(disponibilidades.filter((d) => !(d.diaSemana === dia && d.periodo === periodo.value)));
    } else {
      onChange([
        ...disponibilidades,
        {
          id: Date.now(),
          professorId,
          diaSemana: dia as DisponibilidadeDto['diaSemana'],
          periodo: periodo.value,
          horaInicio: periodo.inicio,
          horaFim: periodo.fim,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', minWidth: 520, gap: 0 }}>
        <Box />
        {DIAS.map((d) => (
          <Box key={d.num} sx={{ textAlign: 'center', py: 0.5 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {d.label}
            </Typography>
          </Box>
        ))}

        {PERIODOS.map((periodo) => (
          <>
            <Box key={`label-${periodo.value}`} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" fontWeight={500}>
                {periodo.label}
              </Typography>
            </Box>
            {DIAS.map((dia) => {
              const checked = isChecked(dia.num, periodo.value);
              return (
                <Box
                  key={`${dia.num}-${periodo.value}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: checked ? 'primary.main' : 'background.default',
                    borderRadius: 0.5,
                    m: 0.25,
                    minHeight: 40,
                    cursor: readOnly ? 'default' : 'pointer',
                  }}
                  onClick={() => toggle(dia.num, periodo)}
                >
                  <Checkbox
                    checked={checked}
                    size="small"
                    disabled={readOnly}
                    sx={{
                      p: 0,
                      color: checked ? '#fff' : 'text.disabled',
                      '&.Mui-checked': { color: '#fff' },
                    }}
                  />
                </Box>
              );
            })}
          </>
        ))}
      </Box>
    </Box>
  );
}
