/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `cooking_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `cooking_methods_name_key` ON `cooking_methods`(`name`);
