/*
  Warnings:

  - You are about to drop the column `description` on the `steps` table. All the data in the column will be lost.
  - You are about to drop the `recipies_on_utensils` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utensils` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `steps` DROP COLUMN `description`,
    ADD COLUMN `name` VARCHAR(1000) NOT NULL;

-- DropTable
DROP TABLE `recipies_on_utensils`;

-- DropTable
DROP TABLE `utensils`;
