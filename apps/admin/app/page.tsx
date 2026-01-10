import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
 const { userId } = await auth();

 if (userId) {
  redirect("/dashboard");
 }

 // If not authenticated, the middleware should have already redirected to login.
 // But just in case, or if middleware config allows public access to root:
 redirect("/login");
}
