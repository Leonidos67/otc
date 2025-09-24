import { motion, useAnimation } from 'motion/react';
import { useEffect } from 'react';

const Copy = ({ width = 28, height = 28, strokeWidth = 2, stroke = '#ffffff', active = false, ...props }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (active) {
      controls.start('animate');
    } else {
      controls.start('normal');
    }
  }, [active, controls]);

  return (
    <div
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
          width="14"
          height="14"
          x="8"
          y="8"
          rx="2"
          ry="2"
          variants={{
            normal: { translateY: 0, translateX: 0 },
            animate: { translateY: -3, translateX: -3 },
          }}
          animate={controls}
          transition={{ type: 'spring', stiffness: 160, damping: 17, mass: 1 }}
        />
        <motion.path
          d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
          variants={{
            normal: { x: 0, y: 0 },
            animate: { x: 3, y: 3 },
          }}
          transition={{ type: 'spring', stiffness: 160, damping: 17, mass: 1 }}
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { Copy };


