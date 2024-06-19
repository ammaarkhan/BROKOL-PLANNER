import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-4 font-bold">Meal Planner</h1>
      <Link className="bg-black text-white py-2 px-4 rounded-lg" href="/signin">Login</Link>
    </main>
  );
}
