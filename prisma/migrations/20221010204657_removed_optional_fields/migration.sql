/*
  Warnings:

  - Made the column `description` on table `recipes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `recipes` MODIFY `description` VARCHAR(191) NOT NULL;
