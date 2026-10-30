-- AlterTable
ALTER TABLE "atividade" ADD COLUMN     "carga_horaria_minutos" INTEGER,
ADD COLUMN     "hora_fim" TIME(0),
ADD COLUMN     "hora_inicio" TIME(0);
