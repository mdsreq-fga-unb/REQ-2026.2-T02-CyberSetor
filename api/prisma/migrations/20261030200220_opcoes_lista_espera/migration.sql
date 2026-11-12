-- AlterTable
ALTER TABLE "configuracao_inscricao" ADD COLUMN     "lista_espera" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "promocao_automatica" BOOLEAN NOT NULL DEFAULT true;
