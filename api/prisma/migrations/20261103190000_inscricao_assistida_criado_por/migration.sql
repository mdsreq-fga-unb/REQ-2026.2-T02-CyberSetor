-- AlterTable
ALTER TABLE "inscricao" ADD COLUMN     "criado_por_id" UUID;

-- CreateIndex
CREATE INDEX "inscricao_criado_por_id_idx" ON "inscricao"("criado_por_id");

-- AddForeignKey
ALTER TABLE "inscricao" ADD CONSTRAINT "inscricao_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
