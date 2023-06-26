/*
  Warnings:

  - You are about to drop the column `recipeId1` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `recipeId2` on the `images` table. All the data in the column will be lost.
  - You are about to drop the `MetadataImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UrlImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[mainImageToRecipe]` on the table `images` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `images_recipeId1_idx` ON `images`;

-- DropIndex
DROP INDEX `images_recipeId2_idx` ON `images`;

-- AlterTable
ALTER TABLE `images` DROP COLUMN `recipeId1`,
    DROP COLUMN `recipeId2`,
    ADD COLUMN `imageToRecipe` VARCHAR(255) NULL,
    ADD COLUMN `mainImageToRecipe` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `MetadataImage`;

-- DropTable
DROP TABLE `UrlImage`;

-- CreateTable
CREATE TABLE `url_images` (
    `url` VARCHAR(191) NOT NULL,
    `imageId` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `url_images_imageId_key`(`imageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metadata_images` (
    `key` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `imageId` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `metadata_images_imageId_key`(`imageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `images_mainImageToRecipe_key` ON `images`(`mainImageToRecipe`);

-- CreateIndex
CREATE INDEX `images_mainImageToRecipe_idx` ON `images`(`mainImageToRecipe`);

-- CreateIndex
CREATE INDEX `images_imageToRecipe_idx` ON `images`(`imageToRecipe`);
