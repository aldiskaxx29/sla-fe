export const snakeToPascal_Utils = (snakeCaseStr) => {
  // Split the snake_case string into words
  const words = snakeCaseStr?.toString().toLowerCase().split(" ");

  // Capitalize the first letter of each word and join them together
  const pascalCaseStr = words
    ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return pascalCaseStr;
};
