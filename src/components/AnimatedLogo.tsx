import { motion } from 'motion/react';
import { Package } from 'lucide-react';

export function AnimatedLogo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { container: "w-10 h-10", icon: "h-5 w-5" },
    md: { container: "w-16 h-16", icon: "h-8 w-8" },
    lg: { container: "w-24 h-24", icon: "h-12 w-12" }
  };

  return (
    <motion.div
      className={`${sizes[size].container} bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden ${className}`}
      animate={{
        boxShadow: [
          '0 10px 40px rgba(34, 197, 94, 0.3)',
          '0 10px 60px rgba(34, 197, 94, 0.5)',
          '0 10px 40px rgba(34, 197, 94, 0.3)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Animated background circles */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute inset-0 rounded-full bg-white"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Icon */}
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Package className={`${sizes[size].icon} text-white relative z-10`} />
      </motion.div>
    </motion.div>
  );
}

export function LogoWithText({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl"
  };

  return (
    <div className="flex items-center gap-3">
      <AnimatedLogo size={size} />
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`${textSizes[size]} font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent`}>
          ملك الماوية
        </h1>
      </motion.div>
    </div>
  );
}
