-- AlterEnum
ALTER TYPE "SituacaoInscricao" ADD VALUE 'LISTA_ESPERA';

-- AlterTable
ALTER TABLE "inscricao" ADD COLUMN     "ordem_chegada" SERIAL NOT NULL;

-- Inscrições anteriores recebem a ordem de chegada pela data de criação.
UPDATE "inscricao" AS i
SET "ordem_chegada" = o.n
FROM (SELECT "id", row_number() OVER (ORDER BY "criado_em", "id") AS n FROM "inscricao") AS o
WHERE i."id" = o."id";
SELECT setval(
  pg_get_serial_sequence('"inscricao"', 'ordem_chegada'),
  COALESCE((SELECT MAX("ordem_chegada") FROM "inscricao"), 0) + 1,
  false
);

-- CreateIndex
CREATE INDEX "inscricao_atividade_id_situacao_ordem_chegada_idx" ON "inscricao"("atividade_id", "situacao", "ordem_chegada");
