import { zodResolver } from '@hookform/resolvers/zod';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cpfSchema, dateSchema, decimalSchema, moneySchema, phoneSchema } from '@/lib/schemas';
import { CpfField, DateField, DecimalField, MoneyField, PhoneField } from './fields';

const schema = z.object({
  telefone: phoneSchema(),
  cpf: cpfSchema(),
  valor: moneySchema(),
  quantidade: decimalSchema('Informe a quantidade.'),
  data: dateSchema('Informe a data.', { notFuture: 'A data não pode ser futura.' }),
});

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

function Form({ initial, onSubmit }: { initial?: Partial<Input>; onSubmit: (v: Output) => void }) {
  const form = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { telefone: '', cpf: '', valor: '', quantidade: '', data: '', ...initial },
  });
  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <PhoneField control={form.control} name="telefone" label="Telefone" />
      <CpfField control={form.control} name="cpf" label="CPF" />
      <MoneyField control={form.control} name="valor" label="Valor" />
      <DecimalField control={form.control} name="quantidade" label="Quantidade" />
      <DateField control={form.control} name="data" label="Data" notFuture />
      <button type="submit">Enviar</button>
      <output aria-label="Alterado">{form.formState.isDirty ? 'sim' : 'não'}</output>
    </form>
  );
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('campos de formulario', () => {
  afterEach(cleanup);

  it('mostra com mascara e entrega o valor da API', async () => {
    const onSubmit = vi.fn();
    render(<Form onSubmit={onSubmit} />);

    type('Telefone', '61999998888');
    type('CPF', '52998224725');
    type('Valor', '150000,5');
    type('Quantidade', '1250,5');
    type('Data', '2026-03-15');

    expect(screen.getByLabelText('Telefone')).toHaveValue('(61) 99999-8888');
    expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25');
    expect(screen.getByLabelText('Quantidade')).toHaveValue('1.250,5');

    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      telefone: '61999998888',
      cpf: '52998224725',
      valor: '150000.50',
      quantidade: '1250.5',
      data: '2026-03-15',
    });
  });

  it('formata o valor que veio da API sem marcar o formulario como alterado', () => {
    render(
      <Form
        initial={{ telefone: '6133334444', cpf: '52998224725', valor: '300000.00' }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Telefone')).toHaveValue('(61) 3333-4444');
    expect(screen.getByLabelText('Valor')).toHaveValue('R$ 300.000,00');
    expect(screen.getByLabelText('Alterado')).toHaveTextContent('não');
  });

  it('valor colado com ponto decimal fica com centavos, nao cem vezes maior', async () => {
    const onSubmit = vi.fn();
    render(<Form onSubmit={onSubmit} />);
    const paste = (label: string, text: string) =>
      fireEvent.paste(screen.getByLabelText(label), { clipboardData: { getData: () => text } });

    paste('Valor', 'R$ 10.50');
    paste('Quantidade', '10.5');
    expect(await screen.findByDisplayValue('R$ 10,50')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade')).toHaveValue('10,5');
  });

  it('telefone colado com +55 fica sem o codigo do pais', () => {
    render(<Form onSubmit={vi.fn()} />);
    type('Telefone', '+55 (61) 99999-8888');
    expect(screen.getByLabelText('Telefone')).toHaveValue('(61) 99999-8888');
  });

  it('recusa com a mensagem ligada ao campo', async () => {
    render(<Form initial={{ data: '2999-01-01' }} onSubmit={vi.fn()} />);
    type('Telefone', '6199');
    type('CPF', '52998224724');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(
      await screen.findByText('Informe o telefone com DDD, como (61) 99999-8888.'),
    ).toBeInTheDocument();
    expect(screen.getByText('CPF inválido. Confira os números.')).toBeInTheDocument();
    expect(screen.getByText('Informe o valor.')).toBeInTheDocument();
    expect(screen.getByText('A data não pode ser futura.')).toBeInTheDocument();
    expect(screen.getByLabelText('CPF')).toHaveAttribute('aria-describedby', 'cpf-error');
    expect(screen.getByLabelText('Data')).toHaveAttribute('max');
  });
});
