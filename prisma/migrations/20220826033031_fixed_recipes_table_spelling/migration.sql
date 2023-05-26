/*
  Warnings:

  - You are about to drop the `recipies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `recipies`;

-- CreateTable
CREATE TABLE `recipes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `prepTime` DECIMAL(65, 30) NOT NULL,
    `cookTime` DECIMAL(65, 30) NOT NULL,
    `mainImage` VARCHAR(255) NOT NULL,
    `authorId` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
