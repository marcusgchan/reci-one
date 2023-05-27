-- CreateIndex
CREATE INDEX `accounts_userId_idx` ON `accounts`(`userId`);

-- CreateIndex
CREATE INDEX `comments_recipeId_idx` ON `comments`(`recipeId`);

-- CreateIndex
CREATE INDEX `comments_authorId_idx` ON `comments`(`authorId`);

-- CreateIndex
CREATE INDEX `cooking_methods_on_recipies_recipeId_idx` ON `cooking_methods_on_recipies`(`recipeId`);

-- CreateIndex
CREATE INDEX `cooking_methods_on_recipies_cookingMethodId_idx` ON `cooking_methods_on_recipies`(`cookingMethodId`);

-- CreateIndex
CREATE INDEX `ingredients_recipeId_idx` ON `ingredients`(`recipeId`);

-- CreateIndex
CREATE INDEX `meal_types_on_recipies_mealTypeId_idx` ON `meal_types_on_recipies`(`mealTypeId`);

-- CreateIndex
CREATE INDEX `meal_types_on_recipies_recipeId_idx` ON `meal_types_on_recipies`(`recipeId`);

-- CreateIndex
CREATE INDEX `nationalities_on_recipies_nationalityId_idx` ON `nationalities_on_recipies`(`nationalityId`);

-- CreateIndex
CREATE INDEX `nationalities_on_recipies_recipeId_idx` ON `nationalities_on_recipies`(`recipeId`);

-- CreateIndex
CREATE INDEX `recipe_images_recipeId_idx` ON `recipe_images`(`recipeId`);

-- CreateIndex
CREATE INDEX `recipes_authorId_idx` ON `recipes`(`authorId`);

-- CreateIndex
CREATE INDEX `sessions_userId_idx` ON `sessions`(`userId`);

-- CreateIndex
CREATE INDEX `steps_recipeId_idx` ON `steps`(`recipeId`);
