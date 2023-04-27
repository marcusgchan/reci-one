/*
  Warnings:

  - You are about to drop the column `viewScope` on the `recipes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `recipes` DROP COLUMN `viewScope`,
    ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT false;
