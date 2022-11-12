/*
  Warnings:

  - You are about to drop the column `link` on the `images` table. All the data in the column will be lost.
  - Added the required column `name` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainImage` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `images` DROP COLUMN `link`,
    ADD COLUMN `name` VARCHAR(127) NOT NULL;

-- AlterTable
ALTER TABLE `recipes` ADD COLUMN `mainImage` VARCHAR(127) NOT NULL;
