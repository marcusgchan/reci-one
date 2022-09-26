/*
  Warnings:

  - The values [ALL] on the enum `recipes_viewScope` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `recipes` MODIFY `viewScope` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE';
