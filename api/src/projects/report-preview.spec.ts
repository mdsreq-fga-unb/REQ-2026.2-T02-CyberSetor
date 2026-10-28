import { NotFoundException } from '@nestjs/common';
import type { AuditTrailService } from '../audit/audit-trail.service.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  AlcanceMeta,
  ModalidadeAfericao,
  OrigemMeta,
  SituacaoMeta,
} from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectsService } from './projects.service.js';

describe('Prévia do Relatório de Execução - reportPreview (unitário)', () => {
  let service: ProjectsService;
  const prismaMock = {
    projeto: { findUnique: vi.fn() },
    meta: { findMany: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProjectsService(
      prismaMock as unknown as PrismaService,
      {} as unknown as AuditTrailService,
    );
  });

  it('recusa período quando a data inicial é posterior à data final', async () => {
    await expect(
      service.reportPreview('proj-1', { from: '2026-06-30', to: '2026-01-01' }),
    ).rejects.toMatchObject({
      response: {
        code: 'INVALID_PERIOD',
        message: 'A data inicial (from) não pode ser posterior à data final (to).',
      },
    });
  });

  it('retorna 404 quando o projeto não é encontrado', async () => {
    prismaMock.projeto.findUnique.mockResolvedValue(null);

    await expect(
      service.reportPreview('proj-inexistente', { from: '2026-01-01', to: '2026-06-30' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('consolida metas com cenários de cumprida, parcialmente cumprida, não cumprida e sem resultado', async () => {
    const projetoId = '00000000-0000-4000-8000-000000000001';
    prismaMock.projeto.findUnique.mockResolvedValue({
      id: projetoId,
      codigo: 'P01',
      titulo: 'Projeto Cultura Viva',
      instrumentoId: 'inst-1',
      inicio: new Date('2026-01-01T03:00:00.000Z'),
      fim: new Date('2026-12-31T03:00:00.000Z'),
    });

    const autor = {
      id: 'usr-1',
      pessoa: { nome: 'Maria Gestora' },
    };

    prismaMock.meta.findMany.mockResolvedValue([
      // Meta 1: Quantitativa cumprida (120 de 100 = 120%)
      {
        id: 'meta-1',
        ordem: 1,
        origem: OrigemMeta.PROJETO,
        objetivo: 'Capacitar jovens',
        descricao: 'Capacitar jovens em artes digitais',
        indicador: 'Jovens formados',
        modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
        parametroPlanejado: '100',
        unidade: 'jovens',
        formaComprovacao: 'Lista de presença',
        periodoInicio: new Date('2026-01-01T03:00:00.000Z'),
        periodoFim: new Date('2026-06-30T03:00:00.000Z'),
        situacao: SituacaoMeta.CONCLUIDA,
        resultados: [
          {
            id: 'res-1',
            dataReferencia: new Date('2026-06-25T03:00:00.000Z'),
            descricao: 'Oficinas finalizadas com sucesso acima da meta',
            valorAlcancado: new Prisma.Decimal(120),
            parametroPlanejado: new Prisma.Decimal(100),
            percentual: new Prisma.Decimal(120),
            alcance: AlcanceMeta.CUMPRIDA,
            registradoPor: autor,
            criadoEm: new Date('2026-06-25T14:00:00.000Z'),
          },
        ],
      },
      // Meta 2: Quantitativa parcialmente cumprida (50 de 100 = 50%)
      {
        id: 'meta-2',
        ordem: 2,
        origem: OrigemMeta.PROJETO,
        objetivo: 'Realizar workshops',
        descricao: 'Workshops comunitários',
        indicador: 'Workshops realizados',
        modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
        parametroPlanejado: '100',
        unidade: 'workshops',
        formaComprovacao: 'Fotos e atas',
        periodoInicio: new Date('2026-01-01T03:00:00.000Z'),
        periodoFim: new Date('2026-06-30T03:00:00.000Z'),
        situacao: SituacaoMeta.EM_ANDAMENTO,
        resultados: [
          {
            id: 'res-2',
            dataReferencia: new Date('2026-06-20T03:00:00.000Z'),
            descricao: 'Metade dos workshops realizados',
            valorAlcancado: new Prisma.Decimal(50),
            parametroPlanejado: new Prisma.Decimal(100),
            percentual: new Prisma.Decimal(50),
            alcance: AlcanceMeta.PARCIALMENTE_CUMPRIDA,
            registradoPor: autor,
            criadoEm: new Date('2026-06-20T14:00:00.000Z'),
          },
        ],
      },
      // Meta 3: Quantitativa não cumprida (0%)
      {
        id: 'meta-3',
        ordem: 3,
        origem: OrigemMeta.PROJETO,
        objetivo: 'Lançar aplicativo',
        descricao: 'App para inscrições',
        indicador: 'Aplicativo em produção',
        modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
        parametroPlanejado: '1',
        unidade: 'app',
        formaComprovacao: 'Link da loja',
        periodoInicio: new Date('2026-01-01T03:00:00.000Z'),
        periodoFim: new Date('2026-06-30T03:00:00.000Z'),
        situacao: SituacaoMeta.PENDENTE,
        resultados: [
          {
            id: 'res-3',
            dataReferencia: new Date('2026-06-30T03:00:00.000Z'),
            descricao: 'Desenvolvimento atrasado por falta de equipe',
            valorAlcancado: new Prisma.Decimal(0),
            parametroPlanejado: new Prisma.Decimal(1),
            percentual: new Prisma.Decimal(0),
            alcance: AlcanceMeta.NAO_CUMPRIDA,
            registradoPor: autor,
            criadoEm: new Date('2026-06-30T10:00:00.000Z'),
          },
        ],
      },
      // Meta 4: Sem resultado registrado no período (array de resultados vazio)
      {
        id: 'meta-4',
        ordem: 4,
        origem: OrigemMeta.PROJETO,
        objetivo: 'Articulação regional',
        descricao: 'Reuniões com lideranças',
        indicador: 'Reuniões realizadas',
        modalidadeAfericao: ModalidadeAfericao.QUANTITATIVA,
        parametroPlanejado: '5',
        unidade: 'reuniões',
        formaComprovacao: 'Atas assinadas',
        periodoInicio: new Date('2026-01-01T03:00:00.000Z'),
        periodoFim: new Date('2026-06-30T03:00:00.000Z'),
        situacao: SituacaoMeta.PENDENTE,
        resultados: [],
      },
      // Meta 5: Qualitativa cumprida
      {
        id: 'meta-5',
        ordem: 5,
        origem: OrigemMeta.PROJETO,
        objetivo: 'Obter certificação',
        descricao: 'Certificação de conformidade',
        indicador: 'Certificado',
        modalidadeAfericao: ModalidadeAfericao.QUALITATIVA,
        parametroPlanejado: null,
        unidade: null,
        formaComprovacao: 'Certidão',
        periodoInicio: new Date('2026-01-01T03:00:00.000Z'),
        periodoFim: new Date('2026-06-30T03:00:00.000Z'),
        situacao: SituacaoMeta.CONCLUIDA,
        resultados: [
          {
            id: 'res-5',
            dataReferencia: new Date('2026-06-15T03:00:00.000Z'),
            descricao: 'Certificação obtida com sucesso',
            valorAlcancado: null,
            parametroPlanejado: null,
            percentual: null,
            alcance: AlcanceMeta.CUMPRIDA,
            registradoPor: autor,
            criadoEm: new Date('2026-06-15T14:00:00.000Z'),
          },
        ],
      },
    ]);

    const res = await service.reportPreview(projetoId, {
      from: '2026-01-01',
      to: '2026-06-30',
    });

    // Confere cabeçalho
    expect(res.projeto.codigo).toBe('P01');
    expect(res.periodo).toEqual({ from: '2026-01-01', to: '2026-06-30' });
    expect(res.metas).toHaveLength(5);

    // Meta 1: Cumprida com 120%
    expect(res.metas[0].status).toBe(AlcanceMeta.CUMPRIDA);
    expect(res.metas[0].percentual).toBe(120);
    expect(res.metas[0].resultado?.valorAlcancado).toBe(120);

    // Meta 2: Parcial com 50%
    expect(res.metas[1].status).toBe(AlcanceMeta.PARCIALMENTE_CUMPRIDA);
    expect(res.metas[1].percentual).toBe(50);

    // Meta 3: Não cumprida com 0%
    expect(res.metas[2].status).toBe(AlcanceMeta.NAO_CUMPRIDA);
    expect(res.metas[2].percentual).toBe(0);

    // Meta 4: Sem resultado registrado no período
    expect(res.metas[3].status).toBeNull();
    expect(res.metas[3].percentual).toBeNull();
    expect(res.metas[3].resultado).toBeNull();

    // Meta 5: Qualitativa cumprida
    expect(res.metas[4].status).toBe(AlcanceMeta.CUMPRIDA);
    expect(res.metas[4].percentual).toBeNull();
    expect(res.metas[4].resultado?.valorAlcancado).toBeNull();
    expect(res.metas[4].resultado?.descricao).toBe('Certificação obtida com sucesso');

    // Valida que o filtro temporal exige gte e lte
    expect(prismaMock.meta.findMany).toHaveBeenCalledTimes(1);
    const lastCall = prismaMock.meta.findMany.mock.lastCall as unknown as [
      { where: { projetoId: string }; include: { resultados: { where: { dataReferencia: unknown } } } },
    ];
    expect(lastCall[0].where).toEqual({ projetoId });
    expect(lastCall[0].include.resultados.where).toEqual({
      dataReferencia: {
        gte: new Date('2026-01-01T00:00:00.000Z'),
        lte: new Date('2026-06-30T00:00:00.000Z'),
      },
    });
  });
});
