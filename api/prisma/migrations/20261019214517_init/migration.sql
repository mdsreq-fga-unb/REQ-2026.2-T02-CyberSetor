-- CreateEnum
CREATE TYPE "TipoInstrumento" AS ENUM ('EDITAL', 'EMENDA', 'PARCERIA');

-- CreateEnum
CREATE TYPE "OrigemMeta" AS ENUM ('EDITAL', 'PROJETO', 'INSTITUTO');

-- CreateEnum
CREATE TYPE "ModalidadeAfericao" AS ENUM ('QUANTITATIVA', 'QUALITATIVA');

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('PRESIDENCIA_GESTAO', 'NUCLEO_PEDAGOGICO', 'ADMINISTRATIVO_FINANCEIRO', 'CONCEDENTE_AUDITORIA', 'ADMINISTRACAO_SISTEMA');

-- CreateEnum
CREATE TYPE "AutorTipo" AS ENUM ('USUARIO', 'SISTEMA', 'PUBLICO');

-- CreateTable
CREATE TABLE "instrumento" (
    "id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "tipo" "TipoInstrumento" NOT NULL,
    "orgao_concedente" TEXT NOT NULL,
    "numero_processo" TEXT NOT NULL,
    "valor_global" DECIMAL(14,2) NOT NULL,
    "data_celebracao" DATE NOT NULL,
    "vigencia_inicio" DATE NOT NULL,
    "vigencia_fim" DATE NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "instrumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projeto" (
    "id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "instrumento_id" UUID NOT NULL,
    "coordenador_id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisito_instrumento" (
    "id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "instrumento_id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "referencia" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "requisito_instrumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta" (
    "id" UUID NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "projeto_id" UUID NOT NULL,
    "ordem" INTEGER NOT NULL,
    "origem" "OrigemMeta" NOT NULL,
    "objetivo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "indicador" TEXT,
    "modalidade_afericao" "ModalidadeAfericao",
    "parametro_planejado" TEXT,
    "unidade" TEXT,
    "periodo_inicio" DATE,
    "periodo_fim" DATE,
    "frequencia_apuracao" TEXT,
    "forma_comprovacao" TEXT,
    "resultado_esperado" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta_requisito" (
    "meta_id" UUID NOT NULL,
    "requisito_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meta_requisito_pkey" PRIMARY KEY ("meta_id","requisito_id")
);

-- CreateTable
CREATE TABLE "setor" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa" (
    "id" UUID NOT NULL,
    "setor_id" UUID,
    "nome" TEXT NOT NULL,
    "cpf" VARCHAR(11),
    "telefone" TEXT,
    "email_contato" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "pessoa_id" UUID NOT NULL,
    "email_login" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deve_trocar_senha" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acesso_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessao" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "ultimo_uso_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revogada_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trilha_auditoria" (
    "id" UUID NOT NULL,
    "autor_tipo" "AutorTipo" NOT NULL,
    "usuario_id" UUID,
    "contexto_previa_de" UUID,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" UUID,
    "antes" JSONB,
    "depois" JSONB,
    "correlation_id" TEXT NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trilha_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "instrumento_numero_processo_idx" ON "instrumento"("numero_processo");

-- CreateIndex
CREATE INDEX "projeto_coordenador_id_idx" ON "projeto"("coordenador_id");

-- CreateIndex
CREATE UNIQUE INDEX "projeto_instrumento_id_codigo_key" ON "projeto"("instrumento_id", "codigo");

-- CreateIndex
CREATE INDEX "requisito_instrumento_instrumento_id_idx" ON "requisito_instrumento"("instrumento_id");

-- CreateIndex
CREATE INDEX "meta_projeto_id_idx" ON "meta"("projeto_id");

-- CreateIndex
CREATE INDEX "meta_requisito_requisito_id_idx" ON "meta_requisito"("requisito_id");

-- CreateIndex
CREATE UNIQUE INDEX "setor_nome_key" ON "setor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_cpf_key" ON "pessoa"("cpf");

-- CreateIndex
CREATE INDEX "pessoa_setor_id_idx" ON "pessoa"("setor_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_pessoa_id_key" ON "usuario"("pessoa_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_login_key" ON "usuario"("email_login");

-- CreateIndex
CREATE UNIQUE INDEX "sessao_token_hash_key" ON "sessao"("token_hash");

-- CreateIndex
CREATE INDEX "sessao_usuario_id_idx" ON "sessao"("usuario_id");

-- CreateIndex
CREATE INDEX "trilha_auditoria_entidade_entidade_id_idx" ON "trilha_auditoria"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "trilha_auditoria_usuario_id_idx" ON "trilha_auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "trilha_auditoria_criado_em_idx" ON "trilha_auditoria"("criado_em");

-- AddForeignKey
ALTER TABLE "projeto" ADD CONSTRAINT "projeto_instrumento_id_fkey" FOREIGN KEY ("instrumento_id") REFERENCES "instrumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto" ADD CONSTRAINT "projeto_coordenador_id_fkey" FOREIGN KEY ("coordenador_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisito_instrumento" ADD CONSTRAINT "requisito_instrumento_instrumento_id_fkey" FOREIGN KEY ("instrumento_id") REFERENCES "instrumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta" ADD CONSTRAINT "meta_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_requisito" ADD CONSTRAINT "meta_requisito_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta_requisito" ADD CONSTRAINT "meta_requisito_requisito_id_fkey" FOREIGN KEY ("requisito_id") REFERENCES "requisito_instrumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_setor_id_fkey" FOREIGN KEY ("setor_id") REFERENCES "setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessao" ADD CONSTRAINT "sessao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilha_auditoria" ADD CONSTRAINT "trilha_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trilha_auditoria" ADD CONSTRAINT "trilha_auditoria_contexto_previa_de_fkey" FOREIGN KEY ("contexto_previa_de") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
