import React from "react";
import type { ActionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const gas = formData.get("gas");
  const electric = formData.get("electric");
  if (!gas || !electric) {
    return {
      message: "Error",
    };
  }

  const gasAmount = Number(gas);
  const electricAmount = Number(electric);

  await prisma.reading.create({
    data: {
      electricCreditReading: electricAmount,
      gasCreditReading: gasAmount,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return {};
};

export default function New() {
  return (
    <div className="mt-4">
      <Form method="post">
        <div className="relative mb-2">
          <label
            htmlFor="gas"
            className="absolute top-1/2 left-2 -translate-y-1/2"
          >
            🔥
          </label>
          <input
            type="number"
            step={0.01}
            name="gas"
            id="gas"
            placeholder="Gas"
            className="rounded bg-neutral-100 px-3 py-2 pl-8 text-black dark:bg-neutral-700 dark:text-white"
            required
          />
        </div>
        <div className="relative mb-2">
          <label htmlFor="electric" className="absolute top-2 left-2">
            ⚡
          </label>
          <input
            type="number"
            step={0.01}
            name="gas"
            id="gas"
            placeholder="Electric"
            className="rounded bg-neutral-100 px-3 py-2 pl-8 text-black dark:bg-neutral-700 dark:text-white"
            required
          />
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard"
            className="rounded bg-sky-600 py-2 px-4 text-white hover:bg-sky-500 active:bg-sky-600"
          >
            Back
          </Link>
          <button
            type="submit"
            className="rounded bg-emerald-600 py-2 px-4 text-white hover:bg-emerald-500 active:bg-emerald-600"
          >
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}
