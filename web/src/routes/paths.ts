export const paths = {
  auth: {
    signIn: '/entrar',
    changePassword: '/trocar-senha',
  },
  dashboard: {
    root: '/',
    accounts: '/contas',
    instruments: '/instrumentos',
    instrument: (id: string) => `/instrumentos/${encodeURIComponent(id)}`,
    modalities: '/modalidades',
  },
} as const;
