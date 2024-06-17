import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-4">Home Page</h1>
      <Link href="/input">Login page</Link>
    </main>
  );
}
