-- AlterTable
ALTER TABLE "inscricao" ALTER COLUMN "chave_duplicidade" DROP NOT NULL;

-- Inscrições já canceladas liberam a chave, para a pessoa poder se inscrever de novo.
UPDATE "inscricao" SET "chave_duplicidade" = NULL WHERE "situacao" = 'CANCELADA';
