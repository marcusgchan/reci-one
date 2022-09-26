/*
  Warnings:

  - You are about to alter the column `viewScope` on the `recipes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("recipes_viewScope")`.

*/
-- AlterTable
ALTER TABLE `recipes` MODIFY `viewScope` ENUM('PUBLIC', 'PRIVATE', 'ALL') NOT NULL DEFAULT 'PRIVATE';
