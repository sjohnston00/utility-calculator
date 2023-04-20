import React, { useState } from "react";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { Doughnut, Line } from "react-chartjs-2";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { prisma } from "~/db.server";
import "chart.js/auto";
import { format } from "date-fns";
import Modal from "~/components/Modal";
import { ChartOptions } from "chart.js/auto";
import { Chart } from "chart.js";
import { log } from "console";
import CurrentBox from "~/components/CurrentBox";
import DoughnutBox from "~/components/DoughnutBox";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels);

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
  } else if (_action === "undo-last") {
    const reading = await prisma.reading.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!reading) {
      throw new Response("Reading not found", {
        status: 404,
      });
    }
    await prisma.reading.delete({
      where: {
        id: reading.id,
      },
    });
  }

  return {};
};

export default function Index() {
  const { readings } = useLoaderData<typeof loader>();
  const gasData = readings.map((reading) => reading.gasCreditReading);
  const electricData = readings.map((reading) => reading.electricCreditReading);
  const currentGasAmount = gasData.at(-1) || 0;
  const currentElectricAmount = electricData.at(-1) || 0;
  const labels = readings.map((d) =>
    format(new Date(d.createdAt), "dd / MM / yy")
  );
  const [showModal, setShowModal] = useState(false);
  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  const noReadings = readings.length === 0;
  const borderDash = [4, 0, 4];
  const options: ChartOptions<"line"> = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    color: "white",
    onHover: (event, chartElements, chart) => {
      if (!event.x || !event.y) return;
      chart.update();

      const { ctx, canvas } = chart;

      ctx.strokeStyle = "#ffffff50";
      ctx.setLineDash(borderDash);

      ctx.beginPath();
      ctx.moveTo(event.x, 0);
      ctx.lineTo(event.x, canvas.height);
      ctx.stroke();

      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(0, event.y);
      ctx.lineTo(canvas.width, event.y);
      ctx.stroke();
    },
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
      datalabels: {
        display: false,
      },
    },
    events: [],
    scales: {
      x: {
        offset: true,
        border: {
          display: false,
          dash: borderDash,
        },
        grid: {
          display: false,
          color: "#ffffff05",
          lineWidth: 2,
          drawTicks: false,
        },
        ticks: {
          backdropPadding: 5,
          maxTicksLimit: 5,
          color: "#ffffff65",
          font: {
            size: 10,
            weight: "600",
          },
        },
      },
      y: {
        offset: true,
        beginAtZero: true,
        border: {
          display: false,
          dash: borderDash,
        },
        grid: {
          color: "#ffffff15",
          lineWidth: 2,
          drawTicks: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
          color: "#ffffff65",
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
  };

  return (
    <>
      <div className="mt-8">
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
          <button
            type="submit"
            className="rounded bg-fuchsia-600 py-2 px-4 text-white hover:bg-fuchsia-500  active:bg-fuchsia-600"
            disabled={noReadings}
            hidden={noReadings}
            onClick={openModal}
          >
            Clear
          </button>
          <Form method="post" hidden={noReadings}>
            <input
              type="hidden"
              name="_action"
              id="_action"
              value="undo-last"
            />
            <button
              type="submit"
              className="rounded bg-amber-600 py-2 px-4 text-white hover:bg-amber-500  active:bg-amber-600"
            >
              Undo Last
            </button>
          </Form>
        </div>
        <Outlet />
        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-4">
          <div className="max-h-96 rounded-lg bg-neutral-700 px-4 py-8 shadow-lg lg:col-span-4">
            <Line
              options={options}
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
          <div className="grid grid-cols-1 grid-rows-2 gap-4 lg:col-span-2">
            <CurrentBox
              title="Electric"
              value={Number(currentElectricAmount)}
            />
            <CurrentBox title="Gas" value={Number(currentGasAmount)} />
          </div>
          <DoughnutBox>
            <Doughnut
              style={{ height: 275 }}
              className="font-sans"
              options={{
                events: [],
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  datalabels: {
                    font: {
                      family: "monospace",
                    },
                    opacity: 0.7,
                    color: "white",
                    formatter: (x) => {
                      return Number(x).toLocaleString("en-GB", {
                        style: "currency",
                        currency: "GBP",
                        minimumFractionDigits: 2,
                      });
                    },
                  },
                },
              }}
              data={{
                labels: ["🔥", "⚡"],
                datasets: [
                  {
                    data: [currentGasAmount, currentElectricAmount],
                    backgroundColor: ["#4f46e5", "#db2777"],
                    hoverBackgroundColor: ["#4f46e5", "#db2777"],
                    hoverBorderColor: ["#4f46e5", "#db2777"],
                    borderColor: ["#4f46e5", "#db2777"],
                  },
                ],
              }}
            />
          </DoughnutBox>
        </div>
      </div>
      <Modal
        closeModal={closeModal}
        isOpen={showModal}
        title="Are you sure you want to clear all the data?"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            This will delete all submitted readings. This action cannot be
            undone.
          </p>
        </div>
        <div className="mt-4">
          <Form
            method="post"
            hidden={noReadings}
            reloadDocument
            className="flex items-center gap-2"
          >
            <input
              type="hidden"
              name="_action"
              id="_action"
              value="clear-data"
            />

            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={closeModal}
            >
              No
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              onClick={closeModal}
            >
              Yes
            </button>
          </Form>
        </div>
      </Modal>
    </>
  );
}
