-- CreateEnum
CREATE TYPE "AlcanceMeta" AS ENUM ('CUMPRIDA', 'PARCIALMENTE_CUMPRIDA', 'NAO_CUMPRIDA');

-- CreateTable
CREATE TABLE "resultado_meta" (
    "id" UUID NOT NULL,
    "meta_id" UUID NOT NULL,
    "data_referencia" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor_alcancado" DECIMAL(14,2),
    "parametro_planejado" DECIMAL(14,2),
    "percentual" DECIMAL(8,2),
    "alcance" "AlcanceMeta" NOT NULL,
    "registrado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultado_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resultado_meta_meta_id_data_referencia_idx" ON "resultado_meta"("meta_id", "data_referencia");

-- CreateIndex
CREATE INDEX "resultado_meta_registrado_por_id_idx" ON "resultado_meta"("registrado_por_id");

-- AddForeignKey
ALTER TABLE "resultado_meta" ADD CONSTRAINT "resultado_meta_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultado_meta" ADD CONSTRAINT "resultado_meta_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
