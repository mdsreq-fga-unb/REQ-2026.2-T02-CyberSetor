-- CreateTable
CREATE TABLE "documento_instrumento" (
    "id" UUID NOT NULL,
    "instrumento_id" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "tipo_conteudo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "enviado_por_id" UUID NOT NULL,
    "enviado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documento_instrumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documento_instrumento_chave_key" ON "documento_instrumento"("chave");

-- CreateIndex
CREATE INDEX "documento_instrumento_instrumento_id_enviado_em_idx" ON "documento_instrumento"("instrumento_id", "enviado_em");

-- AddForeignKey
ALTER TABLE "documento_instrumento" ADD CONSTRAINT "documento_instrumento_instrumento_id_fkey" FOREIGN KEY ("instrumento_id") REFERENCES "instrumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_instrumento" ADD CONSTRAINT "documento_instrumento_enviado_por_id_fkey" FOREIGN KEY ("enviado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
