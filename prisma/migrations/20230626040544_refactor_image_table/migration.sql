/*
  Warnings:

  - You are about to drop the column `isParsed` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the `parsed_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recipe_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `uploaded_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `recipes` DROP COLUMN `isParsed`;

-- DropTable
DROP TABLE `parsed_images`;

-- DropTable
DROP TABLE `recipe_images`;

-- DropTable
DROP TABLE `uploaded_images`;

-- CreateTable
CREATE TABLE `images` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('url', 'attachment') NOT NULL,
    `recipeId1` VARCHAR(255) NOT NULL,
    `recipeId2` VARCHAR(255) NOT NULL,

    INDEX `images_recipeId1_idx`(`recipeId1`),
    INDEX `images_recipeId2_idx`(`recipeId2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UrlImage` (
    `url` VARCHAR(191) NOT NULL,
    `imageId` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `UrlImage_imageId_key`(`imageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetadataImage` (
    `key` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `imageId` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `MetadataImage_imageId_key`(`imageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
