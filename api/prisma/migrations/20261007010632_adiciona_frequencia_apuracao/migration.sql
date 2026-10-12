/*
  Warnings:

  - Added the required column `frequenciaApuracao` to the `RequisitoDojo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequisitoDojo" ADD COLUMN     "frequenciaApuracao" TEXT NOT NULL;
