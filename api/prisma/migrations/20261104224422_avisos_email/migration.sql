-- CreateEnum
CREATE TYPE "TipoAvisoEmail" AS ENUM ('VENCIMENTO', 'VENCIDA', 'SEM_RESPONSAVEL', 'ADICIONAL', 'TRAVA_RELATORIO');

-- CreateEnum
CREATE TYPE "SituacaoAvisoEmail" AS ENUM ('PENDENTE', 'ENVIADO', 'FALHOU', 'INCERTO', 'BLOQUEADO');

-- CreateTable
CREATE TABLE "aviso_meta" (
    "id" UUID NOT NULL,
    "meta_id" UUID NOT NULL,
    "data_aviso" DATE NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aviso_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aviso_email" (
    "id" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "tipo" "TipoAvisoEmail" NOT NULL,
    "situacao" "SituacaoAvisoEmail" NOT NULL DEFAULT 'PENDENTE',
    "usuario_id" UUID NOT NULL,
    "meta_id" UUID,
    "projeto_id" UUID NOT NULL,
    "message_id" TEXT,
    "tentativas" INTEGER NOT NULL DEFAULT 1,
    "erro" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "aviso_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aviso_meta_meta_id_idx" ON "aviso_meta"("meta_id");

-- CreateIndex
CREATE INDEX "aviso_meta_data_aviso_idx" ON "aviso_meta"("data_aviso");

-- CreateIndex
CREATE UNIQUE INDEX "aviso_email_chave_key" ON "aviso_email"("chave");

-- CreateIndex
CREATE INDEX "aviso_email_usuario_id_idx" ON "aviso_email"("usuario_id");

-- CreateIndex
CREATE INDEX "aviso_email_meta_id_idx" ON "aviso_email"("meta_id");

-- CreateIndex
CREATE INDEX "aviso_email_projeto_id_idx" ON "aviso_email"("projeto_id");

-- AddForeignKey
ALTER TABLE "aviso_meta" ADD CONSTRAINT "aviso_meta_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_meta" ADD CONSTRAINT "aviso_meta_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_email" ADD CONSTRAINT "aviso_email_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_email" ADD CONSTRAINT "aviso_email_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aviso_email" ADD CONSTRAINT "aviso_email_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
