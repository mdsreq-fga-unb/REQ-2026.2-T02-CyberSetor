-- CreateEnum
CREATE TYPE "CanalPedido" AS ENUM ('EMAIL', 'TELEFONE', 'WHATSAPP', 'PRESENCIAL', 'OUTRO');

-- AlterTable
ALTER TABLE "inscricao" ADD COLUMN     "comunicados_revogacao_canal" "CanalPedido",
ADD COLUMN     "comunicados_revogados_em" DATE,
ADD COLUMN     "imagem_revogacao_canal" "CanalPedido",
ADD COLUMN     "imagem_revogada_em" DATE;
