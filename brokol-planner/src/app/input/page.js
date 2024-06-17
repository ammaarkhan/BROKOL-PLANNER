import Link from "next/link";

export default function Input() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-4">Meal Planner</h1>
      <p>This is the INPUT page</p>
      <Link href="/recipes">Recipe page</Link>
    </main>
  );
}
