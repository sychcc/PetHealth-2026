-- DropForeignKey
ALTER TABLE "AiAnalysis" DROP CONSTRAINT "AiAnalysis_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "PetChecklistItem" DROP CONSTRAINT "PetChecklistItem_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "Vaccine" DROP CONSTRAINT "Vaccine_pet_id_fkey";

-- DropForeignKey
ALTER TABLE "WeightRecord" DROP CONSTRAINT "WeightRecord_pet_id_fkey";

-- AddForeignKey
ALTER TABLE "Vaccine" ADD CONSTRAINT "Vaccine_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecord" ADD CONSTRAINT "WeightRecord_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetChecklistItem" ADD CONSTRAINT "PetChecklistItem_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysis" ADD CONSTRAINT "AiAnalysis_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
