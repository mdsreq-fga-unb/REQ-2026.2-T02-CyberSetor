import type { ReactNode } from 'react';
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

export function FormField<T extends FieldValues, N extends Path<T>, O extends FieldValues = T>({
  name,
  label,
  description,
  control,
  children,
}: {
  name: N;
  label: string;
  description?: string;
  control: Control<T, unknown, O>;
  children: (
    props: ControllerRenderProps<T, N> & {
      id: string;
      'aria-invalid': boolean;
      'aria-describedby': string | undefined;
    },
  ) => ReactNode;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const describedBy = [
          description && `${name}-description`,
          fieldState.invalid && `${name}-error`,
        ].filter(Boolean);
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            {children({
              ...field,
              id: name,
              'aria-invalid': fieldState.invalid,
              'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
            })}
            {description && (
              <FieldDescription id={`${name}-description`}>{description}</FieldDescription>
            )}
            {fieldState.invalid && <FieldError id={`${name}-error`} errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
