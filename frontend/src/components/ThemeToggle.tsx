import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 relative"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="absolute"
          >
            <Sun className="h-4 w-4" />
            <span className="sr-only">Light mode</span>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="absolute"
          >
            <Moon className="h-4 w-4" />
            <span className="sr-only">Dark mode</span>
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}