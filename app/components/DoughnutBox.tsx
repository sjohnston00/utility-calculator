import React from "react";

type DoughnutBoxProps = {
  children?: React.ReactNode;
};

export default function DoughnutBox({ children }: DoughnutBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-neutral-700 px-4 py-8 text-center tracking-wide shadow lg:col-span-2">
      {children}
    </div>
  );
}
