import React from "react";

type DoughnutBoxProps = {
  children?: React.ReactNode;
};

export default function DoughnutBox({ children }: DoughnutBoxProps) {
  return (
    <div className="my-8 mx-auto flex max-w-md flex-col gap-2 rounded-lg bg-neutral-700 px-4 py-8 text-center tracking-wide shadow">
      <dd className="text-4xl font-extrabold md:text-5xl">{children}</dd>
    </div>
  );
}
