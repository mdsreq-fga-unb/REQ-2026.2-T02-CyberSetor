-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "bloqueado_ate" TIMESTAMPTZ(3),
ADD COLUMN     "falhas_login" INTEGER NOT NULL DEFAULT 0;
