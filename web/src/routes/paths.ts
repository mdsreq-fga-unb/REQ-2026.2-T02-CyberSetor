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
    project: (instrumentId: string, projectId: string) =>
      `/instrumentos/${encodeURIComponent(instrumentId)}/projetos/${encodeURIComponent(projectId)}`,
    modalities: '/modalidades',
    sectors: '/setores',
  },
} as const;
