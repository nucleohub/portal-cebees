import {
  Autocomplete,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  TextField as MuiTextField,
  type TextFieldProps,
} from '@mui/material';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

type FieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
};

export function TextField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
  helperText,
  ...rest
}: FieldProps<T> & Omit<TextFieldProps, 'name'>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MuiTextField
          {...field}
          {...rest}
          label={label}
          required={required}
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperText}
          fullWidth
          value={field.value ?? ''}
        />
      )}
    />
  );
}

interface SelectOption {
  value: string | number;
  label: string;
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
  options,
}: FieldProps<T> & { options: SelectOption[] }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth required={required} error={!!fieldState.error}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} disabled={disabled} value={field.value ?? ''}>
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export function DateField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
}: FieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MuiTextField
          {...field}
          type="date"
          label={label}
          required={required}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          value={field.value ?? ''}
        />
      )}
    />
  );
}

function formatCpf(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i] ?? '0') * (len + 1 - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(9) === parseInt(digits[9] ?? '0') && calc(10) === parseInt(digits[10] ?? '0');
}

export function CpfField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
}: FieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (v) => !v || validateCpf(String(v)) || 'CPF inválido',
      }}
      render={({ field, fieldState }) => (
        <MuiTextField
          {...field}
          label={label}
          required={required}
          disabled={disabled}
          inputProps={{ maxLength: 14 }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          value={field.value ?? ''}
          onChange={(e) => field.onChange(formatCpf(e.target.value))}
        />
      )}
    />
  );
}

export function CurrencyField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
}: FieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MuiTextField
          {...field}
          label={label}
          required={required}
          disabled={disabled}
          type="number"
          inputProps={{ min: 0, step: 0.01 }}
          InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>R$</span> }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          value={field.value ?? ''}
        />
      )}
    />
  );
}

export function RatingField<T extends FieldValues>({
  name,
  control,
  label,
  disabled,
}: FieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <InputLabel shrink sx={{ mb: 0.5 }}>
            {label}
          </InputLabel>
          <Rating
            value={Number(field.value) || null}
            onChange={(_, v) => field.onChange(v)}
            disabled={disabled}
            precision={0.5}
            max={5}
          />
        </div>
      )}
    />
  );
}

interface MultiSelectOption {
  id: number;
  label: string;
}

export function MultiSelectField<T extends FieldValues>({
  name,
  control,
  label,
  required,
  disabled,
  options,
}: FieldProps<T> & { options: MultiSelectOption[] }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          multiple
          options={options}
          getOptionLabel={(o) => o.label}
          value={options.filter((o) => ((field.value as number[] | undefined) ?? []).includes(o.id))}
          onChange={(_, v) => field.onChange(v.map((o) => o.id))}
          disabled={disabled}
          renderInput={(params) => (
            <MuiTextField
              {...params}
              label={label}
              required={required}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}
    />
  );
}
