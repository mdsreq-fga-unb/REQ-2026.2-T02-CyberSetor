-- AlterTable
ALTER TABLE "relatorio" ADD COLUMN     "pdf_chave" TEXT,
ADD COLUMN     "pdf_gerado_em" TIMESTAMPTZ(3),
ADD COLUMN     "pdf_sha256" CHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_pdf_chave_key" ON "relatorio"("pdf_chave");
