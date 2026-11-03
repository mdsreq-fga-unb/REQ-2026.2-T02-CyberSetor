-- CreateTable
CREATE TABLE "relatorio_pdf" (
    "relatorio_id" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "sha256" CHAR(64) NOT NULL,
    "gerado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "relatorio_pdf_pkey" PRIMARY KEY ("relatorio_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_pdf_chave_key" ON "relatorio_pdf"("chave");

-- AddForeignKey
ALTER TABLE "relatorio_pdf" ADD CONSTRAINT "relatorio_pdf_relatorio_id_fkey" FOREIGN KEY ("relatorio_id") REFERENCES "relatorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
