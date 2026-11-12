-- AlterTable
ALTER TABLE "configuracao_inscricao" ADD COLUMN     "termo_compromisso" TEXT;

-- AlterTable
ALTER TABLE "inscricao" ADD COLUMN     "termo_aceito" TEXT,
ADD COLUMN     "termo_aceito_em" TIMESTAMPTZ(3);
