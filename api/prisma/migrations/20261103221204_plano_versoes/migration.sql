-- CreateEnum
CREATE TYPE "TipoVersaoPlano" AS ENUM ('TERMO_ADITIVO', 'APOSTILA', 'OFICIO');

-- CreateTable
CREATE TABLE "plano_versao" (
    "id" UUID NOT NULL,
    "projeto_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "tipo" "TipoVersaoPlano" NOT NULL,
    "data_documento" DATE NOT NULL,
    "documento_origem" TEXT NOT NULL,
    "publicacao" TEXT,
    "justificativa" TEXT,
    "vigencia_fim_anterior" DATE,
    "vigencia_fim_nova" DATE,
    "registrado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plano_versao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_versao_meta" (
    "id" UUID NOT NULL,
    "versao_id" UUID NOT NULL,
    "meta_id" UUID NOT NULL,
    "parametro_antes" TEXT,
    "parametro_depois" TEXT,
    "periodo_inicio_antes" DATE,
    "periodo_inicio_depois" DATE,
    "periodo_fim_antes" DATE,
    "periodo_fim_depois" DATE,

    CONSTRAINT "plano_versao_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plano_versao_registrado_por_id_idx" ON "plano_versao"("registrado_por_id");

-- CreateIndex
CREATE UNIQUE INDEX "plano_versao_projeto_id_numero_key" ON "plano_versao"("projeto_id", "numero");

-- CreateIndex
CREATE INDEX "plano_versao_meta_meta_id_idx" ON "plano_versao_meta"("meta_id");

-- CreateIndex
CREATE UNIQUE INDEX "plano_versao_meta_versao_id_meta_id_key" ON "plano_versao_meta"("versao_id", "meta_id");

-- AddForeignKey
ALTER TABLE "plano_versao" ADD CONSTRAINT "plano_versao_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_versao" ADD CONSTRAINT "plano_versao_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_versao_meta" ADD CONSTRAINT "plano_versao_meta_versao_id_fkey" FOREIGN KEY ("versao_id") REFERENCES "plano_versao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_versao_meta" ADD CONSTRAINT "plano_versao_meta_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
