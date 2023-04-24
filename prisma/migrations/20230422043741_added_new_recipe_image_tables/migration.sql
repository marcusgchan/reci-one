-- DropForeignKey
ALTER TABLE `accounts` DROP FOREIGN KEY `accounts_userId_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_recipeId_fkey`;

-- DropForeignKey
ALTER TABLE `cooking_methods_on_recipies` DROP FOREIGN KEY `cooking_methods_on_recipies_cookingMethodId_fkey`;

-- DropForeignKey
ALTER TABLE `cooking_methods_on_recipies` DROP FOREIGN KEY `cooking_methods_on_recipies_recipeId_fkey`;

-- DropForeignKey
ALTER TABLE `images` DROP FOREIGN KEY `images_recipeId_fkey`;

-- DropForeignKey
ALTER TABLE `ingredients` DROP FOREIGN KEY `ingredients_recipeId_fkey`;

-- DropForeignKey
ALTER TABLE `meal_types_on_recipies` DROP FOREIGN KEY `meal_types_on_recipies_mealTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `meal_types_on_recipies` DROP FOREIGN KEY `meal_types_on_recipies_recipeId_fkey`;

-- DropForeignKey
ALTER TABLE `nationalities_on_recipies` DROP FOREIGN KEY `nationalities_on_recipies_nationalityId_fkey`;

-- DropForeignKey
ALTER TABLE `nationalities_on_recipies` DROP FOREIGN KEY `nationalities_on_recipies_recipeId_fkey`;

-- DropForeignKey
ALTER TABLE `recipes` DROP FOREIGN KEY `recipes_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `steps` DROP FOREIGN KEY `steps_recipeId_fkey`;

-- CreateTable
CREATE TABLE `recipe_images` (
    `id` VARCHAR(191) NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploaded_images` (
    `key` VARCHAR(191) NOT NULL,
    `recipeImageId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `uploaded_images_recipeImageId_key`(`recipeImageId`),
    PRIMARY KEY (`recipeImageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parsed_images` (
    `url` VARCHAR(191) NOT NULL,
    `recipeImageId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `parsed_images_recipeImageId_key`(`recipeImageId`),
    PRIMARY KEY (`recipeImageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
