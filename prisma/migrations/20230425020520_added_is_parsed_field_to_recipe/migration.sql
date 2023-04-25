/*
  Warnings:

  - Added the required column `isParsed` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `recipes` ADD COLUMN `isParsed` BOOLEAN NOT NULL;
