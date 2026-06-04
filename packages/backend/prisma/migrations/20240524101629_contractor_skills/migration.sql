/*
  Warnings:

  - You are about to drop the `_ContractorToSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ContractorToSkills" DROP CONSTRAINT "_ContractorToSkills_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContractorToSkills" DROP CONSTRAINT "_ContractorToSkills_B_fkey";

-- DropTable
DROP TABLE "_ContractorToSkills";

-- CreateTable
CREATE TABLE "contractor_skills" (
    "contractor_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_skills_pkey" PRIMARY KEY ("contractor_id","skill_id")
);

-- AddForeignKey
ALTER TABLE "contractor_skills" ADD CONSTRAINT "contractor_skills_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_skills" ADD CONSTRAINT "contractor_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
