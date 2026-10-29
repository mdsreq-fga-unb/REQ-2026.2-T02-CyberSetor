-- CreateTable
CREATE TABLE "relatorio" (
    "id" UUID NOT NULL,
    "projeto_id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fim" DATE NOT NULL,
    "relatorio_anterior_id" UUID,
    "motivo_retificacao" TEXT,
    "emitido_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_meta" (
    "id" UUID NOT NULL,
    "relatorio_id" UUID NOT NULL,
    "meta_id" UUID NOT NULL,
    "resultado_meta_id" UUID NOT NULL,
    "meta_ordem" INTEGER NOT NULL,
    "meta_origem" "OrigemMeta" NOT NULL,
    "meta_objetivo" TEXT NOT NULL,
    "meta_descricao" TEXT NOT NULL,
    "meta_indicador" TEXT,
    "modalidade_afericao" "ModalidadeAfericao",
    "unidade" TEXT,
    "parametro_planejado" DECIMAL(14,2),
    "valor_alcancado" DECIMAL(14,2),
    "percentual" DECIMAL(8,2),
    "alcance" "AlcanceMeta" NOT NULL,
    "resultado_data_referencia" DATE NOT NULL,
    "resultado_descricao" TEXT NOT NULL,
    "justificativa" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_relatorio_anterior_id_key" ON "relatorio"("relatorio_anterior_id");

-- CreateIndex
CREATE INDEX "relatorio_projeto_id_idx" ON "relatorio"("projeto_id");

-- CreateIndex
CREATE INDEX "relatorio_emitido_por_id_idx" ON "relatorio"("emitido_por_id");

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_projeto_id_periodo_inicio_periodo_fim_versao_key" ON "relatorio"("projeto_id", "periodo_inicio", "periodo_fim", "versao");

-- CreateIndex
CREATE INDEX "relatorio_meta_meta_id_idx" ON "relatorio_meta"("meta_id");

-- CreateIndex
CREATE INDEX "relatorio_meta_resultado_meta_id_idx" ON "relatorio_meta"("resultado_meta_id");

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_meta_relatorio_id_meta_id_key" ON "relatorio_meta"("relatorio_id", "meta_id");

-- AddForeignKey
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_emitido_por_id_fkey" FOREIGN KEY ("emitido_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_relatorio_anterior_id_fkey" FOREIGN KEY ("relatorio_anterior_id") REFERENCES "relatorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_meta" ADD CONSTRAINT "relatorio_meta_relatorio_id_fkey" FOREIGN KEY ("relatorio_id") REFERENCES "relatorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_meta" ADD CONSTRAINT "relatorio_meta_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_meta" ADD CONSTRAINT "relatorio_meta_resultado_meta_id_fkey" FOREIGN KEY ("resultado_meta_id") REFERENCES "resultado_meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
