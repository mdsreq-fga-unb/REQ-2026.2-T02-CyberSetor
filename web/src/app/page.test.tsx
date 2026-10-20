import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('apresenta o sistema', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'CyberSetor' })).toBeInTheDocument();
  });
});
