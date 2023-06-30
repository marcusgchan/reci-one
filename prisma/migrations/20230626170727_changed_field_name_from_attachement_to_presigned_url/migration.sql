/*
  Warnings:

  - The values [attachment] on the enum `images_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `images` MODIFY `type` ENUM('url', 'presignedUrl') NOT NULL;
