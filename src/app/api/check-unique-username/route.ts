import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

// validate username
const usernameQuerySchema = z.object({
  username: usernameValidation,
});
// while typing username check if unique or not
export const GET = async (request: Request) => {
  // //TODO:use this in all other routes
  // if (request.method !== "GET") {
  //   return Response.json(
  //     {
  //       success: false,
  //       message: "Only Get methods allowed",
  //     },
  //     { status: 405 },
  //   );
  // }
  await dbConnect();
  //localhost:3000/api/cuu?username=samir?age=21
  try {
    const { searchParams } = new URL(request.url); // all paramters
    const queryParam = {
      username: searchParams.get("username"), // take only username
    };

    //validate with zod
    const result = usernameQuerySchema.safeParse(queryParam);
    // console.log("result", result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || []; // error of username only
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 },
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      },
    );
  }
};
