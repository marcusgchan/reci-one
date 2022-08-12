/*
  Warnings:

  - You are about to drop the column `recipeId` on the `cooking_methods` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `nationalities` table. All the data in the column will be lost.
  - You are about to drop the column `recipeId` on the `nationalities` table. All the data in the column will be lost.
  - You are about to drop the column `mealType` on the `recipies` table. All the data in the column will be lost.
  - The primary key for the `utensils` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `recipeId` on the `utensils` table. All the data in the column will be lost.
  - The required column `id` was added to the `utensils` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `cooking_methods` DROP COLUMN `recipeId`;

-- AlterTable
ALTER TABLE `nationalities` DROP COLUMN `nationality`,
    DROP COLUMN `recipeId`;

-- AlterTable
ALTER TABLE `recipies` DROP COLUMN `mealType`;

-- AlterTable
ALTER TABLE `utensils` DROP PRIMARY KEY,
    DROP COLUMN `recipeId`,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `cooking_methods_on_recipies` (
    `cookingMethodId` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cookingMethodId`, `recipeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipies_on_utensils` (
    `recipeId` VARCHAR(191) NOT NULL,
    `utensilId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`recipeId`, `utensilId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_types_on_recipies` (
    `mealTypeId` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`mealTypeId`, `recipeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meal_type` (
    `id` VARCHAR(191) NOT NULL,
    `mealType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nationalities_on_recipies` (
    `nationalityId` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`nationalityId`, `recipeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
