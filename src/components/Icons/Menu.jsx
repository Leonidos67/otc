import React from "react";
import { motion, useAnimation } from "motion/react";

const lineVariants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: {
    pathLength: [0.6, 1],
    opacity: [0.5, 1],
    transition: { duration: 0.4, ease: "easeInOut" }
  }
};

const MenuIcon = ({ width = 21, height = 9, stroke = "#ffffff", strokeWidth = 1.6, animate = false, ...props }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    controls.start(animate ? "animate" : "normal");
  }, [animate, controls]);

  return (
    <svg fill="none" height={height} viewBox="0 0 21 9" width={width} xmlns="http://www.w3.org/2000/svg" {...props}>
      <motion.path d="M1 1L19.6667 1" stroke={stroke} strokeLinecap="round" strokeWidth={strokeWidth} variants={lineVariants} animate={controls} initial="normal" />
      <motion.path d="M1 7.7998L10.3333 7.7998" stroke={stroke} strokeLinecap="round" strokeWidth={strokeWidth} variants={lineVariants} animate={controls} initial="normal" />
    </svg>
  );
};

export default MenuIcon;


