-- AlterEnum
ALTER TYPE "SituacaoInscricao" ADD VALUE 'LISTA_ESPERA';

-- AlterTable
ALTER TABLE "inscricao" ADD COLUMN     "posicao_espera" INTEGER;

-- CreateIndex
CREATE INDEX "inscricao_atividade_id_situacao_criado_em_idx" ON "inscricao"("atividade_id", "situacao", "criado_em");
