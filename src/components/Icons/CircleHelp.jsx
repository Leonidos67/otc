"use client";

import React from "react";
import { motion } from "motion/react";

const defaultTransition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
};

const CircleHelp = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  animate = false,
  ...props
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <motion.g
          variants={{
            normal: { translateY: "0%" },
            animate: { translateY: "-2px" },
          }}
          transition={defaultTransition}
          animate={animate ? "animate" : "normal"}
          initial="normal"
        >
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </motion.g>
      </svg>
    </div>
  );
};

export { CircleHelp };
