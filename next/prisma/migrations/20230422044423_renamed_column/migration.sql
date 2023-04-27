-- DropIndex
DROP INDEX `accounts_userId_fkey` ON `accounts`;

-- DropIndex
DROP INDEX `comments_authorId_fkey` ON `comments`;

-- DropIndex
DROP INDEX `comments_recipeId_fkey` ON `comments`;

-- DropIndex
DROP INDEX `cooking_methods_on_recipies_recipeId_fkey` ON `cooking_methods_on_recipies`;

-- DropIndex
DROP INDEX `images_recipeId_fkey` ON `images`;

-- DropIndex
DROP INDEX `ingredients_recipeId_fkey` ON `ingredients`;

-- DropIndex
DROP INDEX `meal_types_on_recipies_recipeId_fkey` ON `meal_types_on_recipies`;

-- DropIndex
DROP INDEX `nationalities_on_recipies_recipeId_fkey` ON `nationalities_on_recipies`;

-- DropIndex
DROP INDEX `recipes_authorId_fkey` ON `recipes`;

-- DropIndex
DROP INDEX `sessions_userId_fkey` ON `sessions`;

-- DropIndex
DROP INDEX `steps_recipeId_fkey` ON `steps`;
