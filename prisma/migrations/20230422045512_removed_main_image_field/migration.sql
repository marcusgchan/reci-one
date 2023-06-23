/*
  Warnings:

  - You are about to drop the column `mainImage` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `recipes` DROP COLUMN `mainImage`;

-- DropTable
DROP TABLE `images`;
