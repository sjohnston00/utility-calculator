import React from "react";

type CurrentBoxProps = {
  title?: string;
  value: number;
};

export default function CurrentBox({ title, value }: CurrentBoxProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-neutral-700 px-4 py-8 text-center tracking-wide shadow">
      <dt className="order-last text-lg font-medium text-neutral-400">
        {title || "Electric"}
      </dt>
      <dd className="text-4xl font-extrabold md:text-5xl">
        £{value.toFixed(2)}
      </dd>
    </div>
  );
}
