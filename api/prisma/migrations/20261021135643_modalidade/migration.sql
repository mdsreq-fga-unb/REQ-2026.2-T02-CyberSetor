-- CreateTable
CREATE TABLE "modalidade" (
    "id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "modalidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modalidade_nome_key" ON "modalidade"("nome");
