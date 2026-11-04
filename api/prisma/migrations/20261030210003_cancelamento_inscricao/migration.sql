-- AlterEnum
ALTER TYPE "SituacaoInscricao" ADD VALUE 'CANCELADA';

-- AlterTable
ALTER TABLE "inscricao" ADD COLUMN     "cancelada_em" DATE,
ADD COLUMN     "cancelamento_canal" "CanalPedido";
