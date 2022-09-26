/*
  Warnings:

  - You are about to drop the column `id` on the `ingredients` table. All the data in the column will be lost.
  - Added the required column `name` to the `ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ingredients` DROP COLUMN `id`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
