-- DropIndex
DROP INDEX `steps_order_key` ON `steps`;

-- AlterTable
ALTER TABLE `steps` ADD PRIMARY KEY (`order`, `recipeId`);
