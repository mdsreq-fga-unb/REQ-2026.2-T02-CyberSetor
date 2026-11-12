-- CreateTable
CREATE TABLE "atividade" (
    "id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "projeto_id" UUID NOT NULL,
    "modalidade_id" UUID NOT NULL,
    "responsavel_id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "local" TEXT NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade_meta" (
    "atividade_id" UUID NOT NULL,
    "meta_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atividade_meta_pkey" PRIMARY KEY ("atividade_id","meta_id")
);

-- CreateIndex
CREATE INDEX "atividade_projeto_id_idx" ON "atividade"("projeto_id");

-- CreateIndex
CREATE INDEX "atividade_modalidade_id_idx" ON "atividade"("modalidade_id");

-- CreateIndex
CREATE INDEX "atividade_responsavel_id_idx" ON "atividade"("responsavel_id");

-- CreateIndex
CREATE INDEX "atividade_meta_meta_id_idx" ON "atividade_meta"("meta_id");

-- AddForeignKey
ALTER TABLE "atividade" ADD CONSTRAINT "atividade_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade" ADD CONSTRAINT "atividade_modalidade_id_fkey" FOREIGN KEY ("modalidade_id") REFERENCES "modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade" ADD CONSTRAINT "atividade_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_meta" ADD CONSTRAINT "atividade_meta_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_meta" ADD CONSTRAINT "atividade_meta_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
