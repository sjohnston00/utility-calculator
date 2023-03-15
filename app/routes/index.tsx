import { json, LoaderArgs, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/dashboard");
  return json({});
}

export default function Index() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-800 sm:flex sm:items-center sm:justify-center">
      <div className="flex gap-2">
        <Link
          to="/join"
          className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-sky-700 shadow-sm hover:bg-sky-50 sm:px-8"
        >
          Sign up
        </Link>
        <Link
          to="/login"
          className="flex items-center justify-center rounded-md bg-sky-500 px-4 py-3 font-medium text-white hover:bg-sky-600"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
