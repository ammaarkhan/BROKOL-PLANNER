import Link from "next/link";
import SignIn from "../components/auth/SignIn";
import AuthDetails from "../components/AuthDetails";

export default function Input() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-4">Meal Planner</h1>
      <SignIn/>
      {/* <Link href="/recipes">Recipe page</Link> */}
    </main>
  );
}
