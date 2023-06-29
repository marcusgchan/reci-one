-- CreateTable
CREATE TABLE `parsed_sites_info` (
    `author` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `parsed_sites_info_recipeId_key`(`recipeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
