import { PulsingBorder, LiquidMetal } from "@paper-design/shaders-react"
import { motion } from "framer-motion"

export default function ShadersBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div aria-hidden className="absolute inset-0">
        <motion.div
          className="w-full h-full opacity-30" // Lowered overall opacity so it keeps UI aesthetic and legible
          initial={{ opacity: 0.1, scale: 1 }}
          animate={{ opacity: 0.3, scale: 1.02, rotate: 2 }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
        >
          <LiquidMetal
            style={{ width: "100%", height: "100%", filter: "blur(10px)" }}
            colorBack="#f3f1ea" // Adjusted to match the specific pastel theme previously used instead of strict black
            colorTint="hsl(29, 77%, 49%)"
            repetition={4}
            softness={0.6}
            shiftRed={0.25}
            shiftBlue={0.25}
            distortion={0.12}
            contour={1}
            shape="plane"
            offsetX={0}
            offsetY={0}
            scale={1}
            rotation={25}
            speed={2}
          />
        </motion.div>
      </div>
    </div>
  )
}
