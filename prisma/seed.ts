import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import {
  DEFAULT_MEAL_TYPES,
  DEFAULT_NATIONALITIES,
  DEFAULT_COOKING_METHODS,
} from "./data";
import { config } from "../src/server/config";

const prisma = new PrismaClient();

async function main() {
  const seedConfig = config.seed;

  console.log("Deleting Meal Types...");
  await prisma.mealType.deleteMany();
  await prisma.$queryRaw`ALTER TABLE meal_types AUTO_INCREMENT = 1`;

  console.log("Deleting Nationalities...");
  await prisma.nationality.deleteMany();
  await prisma.$queryRaw`ALTER TABLE nationalities AUTO_INCREMENT = 1`;

  console.log("Deleting Cooking Methods...");
  await prisma.cookingMethod.deleteMany();
  await prisma.$queryRaw`ALTER TABLE cooking_methods AUTO_INCREMENT = 1`;

  await createDefaultMealTypes();
  await createDefaultNationalities();
  await createDefaultCookingMethods();
  if (seedConfig.withTestRecipesAndUser) {
    await createDefaultRecipies(); // recipies for testing only and also creates test user
  }
}

async function createDefaultMealTypes() {
  console.log("Creating Meal Types...");
  await prisma.mealType.createMany({
    data: DEFAULT_MEAL_TYPES.map((meal) => ({ name: meal })),
  });
}

async function createDefaultNationalities() {
  console.log("Creating Nationalities...");
  await prisma.nationality.createMany({
    data: DEFAULT_NATIONALITIES.map((nationality) => ({ name: nationality })),
  });
}

async function createDefaultCookingMethods() {
  console.log("Creating Cooking Methods...");
  await prisma.cookingMethod.createMany({
    data: DEFAULT_COOKING_METHODS.map((cookingMethod) => ({
      name: cookingMethod,
    })),
  });
}

async function createDefaultRecipies() {
  console.log("Creating Recipes...");

  const testUser1 = await prisma.user.create({
    data: {
      email: "testUser1@test.com",
      name: "testUser1",
    },
  });

  const mealTypes = await prisma.mealType.findMany();
  const nationalities = await prisma.nationality.findMany();
  const cookingMethods = await prisma.cookingMethod.findMany();

  Array.from({ length: 10 }).forEach(
    async () =>
      await prisma.recipe.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          cookTime: faker.datatype.float(),
          prepTime: faker.datatype.float(),
          mainImage: {
            create: {
              type: "url",
              urlImage: {
                create: {
                  url: "https://picsum.photos/200/300",
                },
              },
            },
          },
          isPublic: false,
          mealTypes: {
            create: [
              {
                mealType: {
                  connect: {
                    id: mealTypes[0]?.id,
                  },
                },
              },
              {
                mealType: {
                  connect: {
                    id: mealTypes[1]?.id,
                  },
                },
              },
            ],
          },
          nationalities: {
            create: {
              nationality: {
                connect: {
                  id: nationalities[0]?.id,
                },
              },
            },
          },
          cookingMethods: {
            create: {
              cookingMethod: {
                connect: {
                  id: cookingMethods[0]?.id,
                },
              },
            },
          },
          authorId: testUser1.id,
          ingredients: {
            create: Array.from({ length: 6 }).map((_, index) => ({
              order: index,
              name: faker.commerce.productName(),
            })),
          },
          steps: {
            create: Array.from({ length: 7 }).map((_, index) => ({
              order: index,
              name: faker.commerce.productDescription(),
            })),
          },
        },
      })
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
