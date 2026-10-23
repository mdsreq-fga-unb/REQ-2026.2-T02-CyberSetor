-- CreateEnum
CREATE TYPE "SituacaoMeta" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA');

-- AlterTable
ALTER TABLE "meta" ADD COLUMN     "responsavel_id" UUID,
ADD COLUMN     "setor_id" UUID,
ADD COLUMN     "situacao" "SituacaoMeta" NOT NULL DEFAULT 'PENDENTE';

-- CreateIndex
CREATE INDEX "meta_responsavel_id_idx" ON "meta"("responsavel_id");

-- CreateIndex
CREATE INDEX "meta_setor_id_idx" ON "meta"("setor_id");

-- AddForeignKey
ALTER TABLE "meta" ADD CONSTRAINT "meta_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta" ADD CONSTRAINT "meta_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
