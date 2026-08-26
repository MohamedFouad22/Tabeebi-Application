import mogoose from "mongoose";

export const connectionDB = async () => {
  try {
    await mogoose.connect((process.env.DB_URL as string) || "");
    console.log("DataBase Connected Successfully 👌");
  } catch (error) {
    console.log("Failed To Connect DB ❌");
  }
};
