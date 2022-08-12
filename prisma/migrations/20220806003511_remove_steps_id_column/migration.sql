/*
  Warnings:

  - The primary key for the `steps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `steps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[order]` on the table `steps` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `steps` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- CreateIndex
CREATE UNIQUE INDEX `steps_order_key` ON `steps`(`order`);
