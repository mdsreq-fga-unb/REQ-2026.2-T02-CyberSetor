-- CreateEnum
CREATE TYPE "CampoInscricao" AS ENUM ('EMAIL', 'CPF', 'BAIRRO_REGIAO', 'ESCOLARIDADE');

-- CreateEnum
CREATE TYPE "CampoDuplicidade" AS ENUM ('EMAIL', 'CPF');

-- CreateTable
CREATE TABLE "configuracao_inscricao" (
    "atividade_id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "aberta" BOOLEAN NOT NULL DEFAULT true,
    "vagas" INTEGER NOT NULL,
    "campos_adicionais" "CampoInscricao"[],
    "campo_duplicidade" "CampoDuplicidade" NOT NULL,
    "codigo_publico" TEXT NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "configuracao_inscricao_pkey" PRIMARY KEY ("atividade_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_inscricao_codigo_publico_key" ON "configuracao_inscricao"("codigo_publico");

-- AddForeignKey
ALTER TABLE "configuracao_inscricao" ADD CONSTRAINT "configuracao_inscricao_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
