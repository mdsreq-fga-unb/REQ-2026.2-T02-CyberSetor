-- AlterTable
ALTER TABLE "relatorio" ADD COLUMN     "emitido_por_nome" TEXT,
ADD COLUMN     "instrumento_tipo" "TipoInstrumento",
ADD COLUMN     "numero_processo" TEXT,
ADD COLUMN     "orgao_concedente" TEXT,
ADD COLUMN     "projeto_codigo" TEXT,
ADD COLUMN     "projeto_titulo" TEXT;

-- Relatórios emitidos antes desta migração recebem o cabeçalho atual do projeto.
UPDATE "relatorio" r
SET "projeto_codigo" = p."codigo",
    "projeto_titulo" = p."titulo",
    "instrumento_tipo" = i."tipo",
    "orgao_concedente" = i."orgao_concedente",
    "numero_processo" = i."numero_processo",
    "emitido_por_nome" = pe."nome"
FROM "projeto" p, "instrumento" i, "usuario" u, "pessoa" pe
WHERE p."id" = r."projeto_id"
  AND i."id" = p."instrumento_id"
  AND u."id" = r."emitido_por_id"
  AND pe."id" = u."pessoa_id";

ALTER TABLE "relatorio" ALTER COLUMN "emitido_por_nome" SET NOT NULL,
ALTER COLUMN "instrumento_tipo" SET NOT NULL,
ALTER COLUMN "numero_processo" SET NOT NULL,
ALTER COLUMN "orgao_concedente" SET NOT NULL,
ALTER COLUMN "projeto_codigo" SET NOT NULL,
ALTER COLUMN "projeto_titulo" SET NOT NULL;
