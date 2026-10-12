-- CreateTable
CREATE TABLE "RequisitoDojo" (
    "id" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "indicador" TEXT NOT NULL,
    "parametroAfericao" TEXT NOT NULL,
    "formaVerificacao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequisitoDojo_pkey" PRIMARY KEY ("id")
);
