/*
  Warnings:

  - You are about to drop the column `nane` on the `cooking_methods` table. All the data in the column will be lost.
  - Added the required column `name` to the `cooking_methods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cooking_methods` DROP COLUMN `nane`,
    ADD COLUMN `name` VARCHAR(255) NOT NULL;
