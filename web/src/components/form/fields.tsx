'use client';

import type { ComponentProps } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { NumberFormatBase, NumericFormat, type NumberFormatValues } from 'react-number-format';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import { formatCpf, formatPhone, onlyDigits, phoneDigits, todayInBrasilia } from '@/lib/br';

/**
 * Campos de formulário prontos para o React Hook Form, sobre o `FormField` (rótulo, descrição,
 * erro e `aria-describedby`). O valor guardado no formulário é o da API; a máscara é só
 * exibição. As regras de cada um estão em `lib/schemas.ts`.
 */

type InputProps = Omit<
  ComponentProps<'input'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'type' | 'ref'
>;

type FieldProps<T extends FieldValues, N extends Path<T>, O extends FieldValues> = InputProps & {
  control: Control<T, unknown, O>;
  name: N;
  label: string;
  description?: string;
};

export function TextField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>({
  control,
  name,
  label,
  description,
  type = 'text',
  ...input
}: FieldProps<T, N, O> & { type?: 'text' | 'email' | 'search' | 'url' }) {
  return (
    <FormField control={control} name={name} label={label} description={description}>
      {(props) => <Input {...input} {...props} value={props.value ?? ''} type={type} />}
    </FormField>
  );
}

/** Posições do cursor só junto de dígitos, para não parar dentro de "(", ")" ou "-". */
function digitBoundary(formatted: string): boolean[] {
  return Array.from(
    { length: formatted.length + 1 },
    (_, i) =>
      formatted.length === 0 || /\d/.test(formatted[i - 1] ?? '') || /\d/.test(formatted[i] ?? ''),
  );
}

function DigitsField<T extends FieldValues, N extends Path<T>, O extends FieldValues>({
  control,
  name,
  label,
  description,
  format,
  normalize,
  ...input
}: FieldProps<T, N, O> & {
  type: 'tel' | 'text';
  format: (digits: string) => string;
  normalize: (text: string) => string;
}) {
  return (
    <FormField control={control} name={name} label={label} description={description}>
      {({ value, onChange, ref, ...props }) => (
        <NumberFormatBase
          {...input}
          {...props}
          customInput={Input}
          getInputRef={ref}
          value={value ?? ''}
          valueIsNumericString
          format={(digits) => format(digits.slice(0, 11))}
          removeFormatting={(text) => normalize(text).slice(0, 11)}
          getCaretBoundary={digitBoundary}
          onValueChange={(values: NumberFormatValues, { source }) => {
            // Só a digitação muda o formulário; a formatação do valor recebido não.
            if (source === 'event') onChange(values.value);
          }}
        />
      )}
    </FormField>
  );
}

/** Telefone com DDD: mostra (61) 99999-8888 e guarda 61999998888; aceita colar com +55. */
export function PhoneField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>(
  props: FieldProps<T, N, O>,
) {
  return (
    <DigitsField
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="(61) 99999-8888"
      {...props}
      format={formatPhone}
      normalize={phoneDigits}
    />
  );
}

/** CPF: mostra 000.000.000-00 e guarda só os 11 dígitos. */
export function CpfField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>(
  props: FieldProps<T, N, O>,
) {
  return (
    <DigitsField
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="000.000.000-00"
      {...props}
      format={formatCpf}
      normalize={onlyDigits}
    />
  );
}

/** "10.50" ou "R$ 10.50": um ponto só, com até duas casas depois dele. */
const PASTED_DECIMAL = /^\s*(?:R\$\s*)?(\d+\.\d{1,2})\s*$/;

type NumberFieldProps<T extends FieldValues, N extends Path<T>, O extends FieldValues> = FieldProps<
  T,
  N,
  O
> & { prefix?: string; fixedDecimals?: boolean };

function NumberField<T extends FieldValues, N extends Path<T>, O extends FieldValues>({
  control,
  name,
  label,
  description,
  prefix,
  fixedDecimals,
  ...input
}: NumberFieldProps<T, N, O>) {
  return (
    <FormField control={control} name={name} label={label} description={description}>
      {({ value, onChange, ref, ...props }) => (
        <NumericFormat
          inputMode="decimal"
          autoComplete="off"
          {...input}
          {...props}
          customInput={Input}
          getInputRef={ref}
          value={value ?? ''}
          valueIsNumericString
          prefix={prefix}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale={fixedDecimals}
          allowNegative={false}
          isAllowed={({ floatValue }) => floatValue === undefined || floatValue < 1e12}
          onPaste={(event) => {
            // Valor copiado em formato inglês ("10.50"): o ponto é decimal, não milhar.
            const text = event.clipboardData.getData('text');
            const match = PASTED_DECIMAL.exec(text);
            if (!match) return;
            event.preventDefault();
            onChange(match[1]);
          }}
          onValueChange={(values, { source }) => {
            if (source === 'event') onChange(values.value);
          }}
        />
      )}
    </FormField>
  );
}

/** Valor em reais: mostra R$ 150.000,00 e guarda "150000.00". */
export function MoneyField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>(
  props: FieldProps<T, N, O>,
) {
  return <NumberField placeholder="R$ 0,00" {...props} prefix="R$ " fixedDecimals />;
}

/** Número com até duas casas: mostra 1.250,5 e guarda "1250.5". */
export function DecimalField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>(
  props: FieldProps<T, N, O>,
) {
  return <NumberField {...props} />;
}

/** Hora no seletor nativo do navegador; guarda HH:MM. */
export function TimeField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>({
  control,
  name,
  label,
  description,
  ...input
}: FieldProps<T, N, O>) {
  return (
    <FormField control={control} name={name} label={label} description={description}>
      {(props) => <Input {...input} {...props} value={props.value ?? ''} type="time" />}
    </FormField>
  );
}

/**
 * Data no seletor nativo do navegador, que no celular abre o calendário do sistema e guarda
 * AAAA-MM-DD. Com `notFuture`, o limite é hoje em Brasília.
 */
export function DateField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>({
  control,
  name,
  label,
  description,
  notFuture,
  max,
  ...input
}: FieldProps<T, N, O> & { notFuture?: boolean }) {
  return (
    <FormField control={control} name={name} label={label} description={description}>
      {(props) => (
        <Input
          {...input}
          {...props}
          value={props.value ?? ''}
          type="date"
          max={notFuture ? todayInBrasilia() : max}
        />
      )}
    </FormField>
  );
}
