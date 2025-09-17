import React from "react";
import { motion, useAnimation } from "motion/react";

const blockVariants = {
  normal: {
    scale: 1,
    rotate: 0
  },
  animate: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const pathVariants = {
  normal: {
    pathLength: 1,
    opacity: 1
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0.3, 1],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

const Blocks = ({ width = 20, height = 20, strokeWidth = 1.8, stroke = "#ffffff", animate = false, ...props }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start(animate ? "animate" : "normal");
  }, [animate, controls]);

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
        <motion.rect
          width="7"
          height="7"
          x="14"
          y="3"
          rx="1"
          variants={blockVariants}
          animate={controls}
          initial="normal"
        />
        <motion.path
          d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"
          variants={pathVariants}
          animate={controls}
          initial="normal"
        />
      </svg>
    </div>
  );
};

export default Blocks;


