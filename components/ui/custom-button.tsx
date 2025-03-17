"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ButtonProps as ShadcnButtonProps } from "@/components/ui/button"

export interface CustomButtonProps extends ShadcnButtonProps {
  yellowStyle?: boolean
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, yellowStyle = true, variant, children, ...props }, ref) => {
    // If yellowStyle is false or variant is outline, use a white button
    if (!yellowStyle || variant === "outline") {
      return (
        <motion.button
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-3 text-base font-bold text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #000",
            boxShadow: "0 4px 0 #000",
            transform: "translateY(-4px)",
          }}
          whileTap={{
            boxShadow: "0 0px 0 #000",
            transform: "translateY(0px)",
            transition: { duration: 0.1 },
          }}
          whileHover={{
            boxShadow: "0 5px 0 #000",
            transform: "translateY(-5px)",
            transition: { duration: 0.2 },
          }}
          {...props}
        >
          {children}
        </motion.button>
      )
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-3 text-base font-bold text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        style={{
          backgroundColor: "#FFE14D",
          border: "2px solid #000",
          boxShadow: "0 4px 0 #000",
          transform: "translateY(-4px)",
        }}
        whileTap={{
          boxShadow: "0 0px 0 #000",
          transform: "translateY(0px)",
          transition: { duration: 0.1 },
        }}
        whileHover={{
          boxShadow: "0 5px 0 #000",
          transform: "translateY(-5px)",
          transition: { duration: 0.2 },
        }}
        {...props}
      >
        {children}
      </motion.button>
    )
  },
)

CustomButton.displayName = "CustomButton"

export { CustomButton }

