import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('POST /requisitos-dojo', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await prisma.requisitoDojo.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejeita entrada incompleta e propriedade desconhecida', async () => {
    const response = await request(app.getHttpServer())
      .post('/requisitos-dojo')
      .send({ origem: '', campoInventado: true })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'property campoInventado should not exist',
        'origem é obrigatória',
      ]),
    );
  });

  it('persiste uma entrada válida e devolve 201 com id', async () => {
    const response = await request(app.getHttpServer())
      .post('/requisitos-dojo')
      .send({
        origem: 'Edital',
        indicador: 'participantes com presença registrada',
        parametroAfericao: 'quantidade por atividade',
        formaVerificacao: 'lista de presença',
        frequenciaApuracao: 'por atividade',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        origem: 'Edital',
      }),
    );
  });

  it('lista por GET o registro criado', async () => {
    const response = await request(app.getHttpServer())
      .get('/requisitos-dojo')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ origem: 'Edital' }),
      ]),
    );
  });
});
