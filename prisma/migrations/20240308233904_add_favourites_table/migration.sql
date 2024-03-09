-- CreateTable
CREATE TABLE `favourite_recipes` (
    `userId` VARCHAR(255) NOT NULL,
    `recipeId` VARCHAR(255) NOT NULL,

    INDEX `favourite_recipes_userId_idx`(`userId`),
    INDEX `favourite_recipes_recipeId_idx`(`recipeId`),
    PRIMARY KEY (`userId`, `recipeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
