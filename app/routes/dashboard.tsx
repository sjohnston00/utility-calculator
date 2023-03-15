import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import { prisma } from "~/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const readings = await prisma.reading.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return { readings };
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const _action = formData.get("_action")?.toString();
  if (_action === "clear-data") {
    await prisma.reading.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  return {};
};

export default function Index() {
  const { readings } = useLoaderData<typeof loader>();

  const gasData = readings.map((reading) => reading.gasCreditReading);
  const electricData = readings.map((reading) => reading.electricCreditReading);
  const labels = readings.map((d) => new Date(d.createdAt).toLocaleString());
  return (
    <div>
      <h1 className="mb-8 text-5xl font-bold tracking-wide">Dasboard</h1>
      <div className="flex items-center gap-4">
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-sky-600 py-2 px-4 hover:bg-sky-500 active:bg-sky-600"
          >
            Logout
          </button>
        </Form>
        <Link
          to="new"
          className="rounded bg-emerald-600 py-2 px-4 hover:bg-emerald-500 active:bg-emerald-600"
        >
          New
        </Link>
        <Form method="post">
          <input type="hidden" name="_action" id="_action" value="clear-data" />
          <button
            type="submit"
            className="rounded bg-fuchsia-600 py-2 px-4 hover:bg-fuchsia-500 active:bg-fuchsia-600"
          >
            Clear
          </button>
        </Form>
      </div>
      <Outlet />
      <Line
        options={{
          color: "white",
          maintainAspectRatio: true,
          responsive: true,
          datasets: {
            line: {
              tension: 0.15,
            },
          },
        }}
        data={{
          labels: labels,
          datasets: [
            { data: gasData, label: "🔥" },
            { data: electricData, label: "⚡" },
          ],
        }}
      />
    </div>
  );
}
