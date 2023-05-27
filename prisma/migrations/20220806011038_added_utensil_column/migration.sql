/*
  Warnings:

  - The primary key for the `utensils` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `utensils` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[utensil]` on the table `utensils` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `utensil` to the `utensils` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `utensils` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `utensil` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`utensil`);

-- CreateIndex
CREATE UNIQUE INDEX `utensils_utensil_key` ON `utensils`(`utensil`);
