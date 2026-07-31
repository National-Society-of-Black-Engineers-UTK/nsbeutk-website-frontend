"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";

type StatCounterProps = {
  value: number;
  label: string;
  suffix?: string;
};

export function StatCounter({ value, label, suffix = "" }: StatCounterProps) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p ref={ref} className="text-4xl font-bold text-primary dark:text-secondary">
        {display}
        {suffix}
      </p>
      <p className="text-sm font-medium text-caption">{label}</p>
    </div>
  );
}
