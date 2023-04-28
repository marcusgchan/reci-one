/*
  Warnings:

  - Added the required column `nationality` to the `nationalities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `nationalities` ADD COLUMN `nationality` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `recipies` MODIFY `description` VARCHAR(191) NULL;
