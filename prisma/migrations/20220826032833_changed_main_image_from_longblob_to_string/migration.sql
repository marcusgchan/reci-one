/*
  Warnings:

  - Made the column `mainImage` on table `recipies` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `recipies` MODIFY `mainImage` VARCHAR(255) NOT NULL;
