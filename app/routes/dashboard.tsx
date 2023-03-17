import React, { useEffect, useState } from "react";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { Line } from "react-chartjs-2";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { prisma } from "~/db.server";
import "chart.js/auto";
import { format } from "date-fns";

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
  const labels = readings.map((d) =>
    format(new Date(d.createdAt), "dd / MM / yy")
  );

  return (
    <div>
      <h1 className="mb-8 text-5xl font-bold tracking-wide">Dasboard</h1>
      <div className="flex items-center gap-4">
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-sky-600 py-2 px-4 text-white hover:bg-sky-500 active:bg-sky-600"
          >
            Logout
          </button>
        </Form>
        <Link
          to="new"
          className="rounded bg-emerald-600 py-2 px-4 text-white hover:bg-emerald-500  active:bg-emerald-600"
        >
          New
        </Link>
        <Form method="post">
          <input type="hidden" name="_action" id="_action" value="clear-data" />
          <button
            type="submit"
            className="rounded bg-fuchsia-600 py-2 px-4 text-white hover:bg-fuchsia-500  active:bg-fuchsia-600"
          >
            Clear
          </button>
        </Form>
      </div>
      <Outlet />
      <div className="mt-8 h-96">
        <Line
          options={{
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            color: "white",
            datasets: {
              line: {
                tension: 0.35,
                borderCapStyle: "round",
              },
            },
            devicePixelRatio: 1,
            elements: {
              point: {
                radius: 0,
              },
            },
            plugins: {
              legend: {
                onClick: () => null,
              },
            },
            scales: {
              x: {
                offset: true,
                border: {
                  display: false,
                  dash: [4, 0, 4],
                },
                grid: {
                  display: false,
                  color: "#ffffff05",
                  lineWidth: 2,
                  drawTicks: false,
                },
                ticks: {
                  backdropPadding: 5,
                  display: false,
                  maxTicksLimit: 2,
                  font: {
                    size: 11,
                    weight: "600",
                  },
                },
              },
              y: {
                offset: true,
                beginAtZero: true,
                border: {
                  display: false,
                  dash: [4, 0, 4],
                },
                grid: {
                  color: "#ffffff05",
                  lineWidth: 2,
                  drawTicks: false,
                  offset: true,
                },
                ticks: {
                  maxTicksLimit: 7,
                  color: "gray",
                  padding: 5,
                  stepSize: 0.5,
                  callback(tickValue, index, ticks) {
                    return tickValue.toLocaleString("en-GB", {
                      style: "currency",
                      currency: "GBP",
                    });
                  },
                  font: {
                    size: 11,
                    weight: "600",
                  },
                },
              },
            },
          }}
          data={{
            labels: labels,
            datasets: [
              {
                data: gasData,
                label: "🔥",
                backgroundColor: "transparent",
                borderColor: "#4f46e5",
              },
              {
                data: electricData,
                label: "⚡",
                backgroundColor: "transparent",
                borderColor: "#db2777",
              },
            ],
          }}
          style={{
            height: 900,
          }}
        />
      </div>
    </div>
  );
}
