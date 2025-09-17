import React from "react";
import { motion, useAnimation } from "motion/react";

const bookmarkVariants = {
  normal: {
    scaleY: 1,
    originY: 0
  },
  animate: {
    scaleY: [1.2, 0.8, 1],
    transition: {
      duration: 0.6,
      times: [0.4, 0.7, 1],
      ease: "easeInOut"
    }
  }
};

const Album = ({ width = 20, height = 20, strokeWidth = 1.8, stroke = "#ffffff", animate = false, ...props }) => {
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
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <motion.path
          d="M11 3 L11 11 L14 8 L17 11 L17 3"
          variants={bookmarkVariants}
          animate={controls}
          initial="normal"
        />
      </svg>
    </div>
  );
};

export default Album;


