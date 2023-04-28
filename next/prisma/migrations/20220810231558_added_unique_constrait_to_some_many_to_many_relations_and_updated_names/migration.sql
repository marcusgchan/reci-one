/*
  Warnings:

  - You are about to drop the column `comment` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `cooking_methods` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `nationalities` table. All the data in the column will be lost.
  - You are about to drop the column `utensil` on the `utensils` table. All the data in the column will be lost.
  - You are about to drop the `meal_type` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `nationalities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `utensils` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nane` to the `cooking_methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `nationalities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `utensils` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `utensils_utensil_key` ON `utensils`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `comment`,
    ADD COLUMN `description` VARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE `cooking_methods` DROP COLUMN `method`,
    ADD COLUMN `nane` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `nationalities` DROP COLUMN `nationality`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `utensils` DROP COLUMN `utensil`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `meal_type`;

-- CreateTable
CREATE TABLE `meal_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `meal_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `nationalities_name_key` ON `nationalities`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `utensils_name_key` ON `utensils`(`name`);
