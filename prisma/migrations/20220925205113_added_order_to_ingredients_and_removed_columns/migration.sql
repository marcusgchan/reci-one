/*
  Warnings:

  - The primary key for the `ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `measurement` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order` to the `ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ingredients` DROP PRIMARY KEY,
    DROP COLUMN `measurement`,
    DROP COLUMN `name`,
    DROP COLUMN `unit`,
    ADD COLUMN `isHeader` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `order` INTEGER NOT NULL,
    ADD PRIMARY KEY (`order`, `recipeId`);

-- AlterTable
ALTER TABLE `steps` ADD COLUMN `isHeader` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `Example`;
