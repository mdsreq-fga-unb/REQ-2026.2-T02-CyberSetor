-- CreateEnum
CREATE TYPE "SituacaoInscricao" AS ENUM ('CONFIRMADA');

-- CreateTable
CREATE TABLE "participante" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "email" TEXT,
    "cpf" VARCHAR(11),
    "bairro_regiao" TEXT,
    "escolaridade" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricao" (
    "id" UUID NOT NULL,
    "atividade_id" UUID NOT NULL,
    "participante_id" UUID NOT NULL,
    "situacao" "SituacaoInscricao" NOT NULL DEFAULT 'CONFIRMADA',
    "chave_duplicidade" TEXT NOT NULL,
    "versao_aviso" TEXT NOT NULL,
    "aviso_apresentado_em" TIMESTAMPTZ(3) NOT NULL,
    "autoriza_comunicados" BOOLEAN NOT NULL,
    "autoriza_imagem" BOOLEAN NOT NULL,
    "responsavel_nome" TEXT,
    "responsavel_telefone" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "participante_cpf_idx" ON "participante"("cpf");

-- CreateIndex
CREATE INDEX "participante_email_idx" ON "participante"("email");

-- CreateIndex
CREATE INDEX "inscricao_participante_id_idx" ON "inscricao"("participante_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscricao_atividade_id_chave_duplicidade_key" ON "inscricao"("atividade_id", "chave_duplicidade");

-- AddForeignKey
ALTER TABLE "inscricao" ADD CONSTRAINT "inscricao_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricao" ADD CONSTRAINT "inscricao_participante_id_fkey" FOREIGN KEY ("participante_id") REFERENCES "participante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
