"use client";

import { motion } from "framer-motion";

export default function CanceladoPage() {
  return (
    <div className="w-full h-screen bg-[#8b7bbd] overflow-hidden flex items-center justify-center relative">
      {/* LINHAS ANIMADAS */}
      {[0, 1, 2, 3].map((item) => (
        <motion.div
          key={item}
          initial={{
            x: -1200,
            opacity: 0,
          }}
          animate={{
            x: 1200,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: item * 0.12,
            ease: "easeOut",
          }}
          className="absolute bg-white rounded-full rotate-[-32deg]"
          style={{
            width: item % 2 === 0 ? 700 : 500,
            height: item % 2 === 0 ? 5 : 3,
            top: `${35 + item * 7}%`,
          }}
        />
      ))}

      {/* CONTEÚDO */}
      <div className="relative flex flex-col items-center justify-center">
        {/* CÍRCULO */}
        <motion.div
          initial={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 120,
          }}
          className="w-[300px] h-[300px] bg-[#ff5f5f] rounded-full flex items-center justify-center shadow-2xl border-[6px] border-white"
        >
          {/* X */}
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: 0.5,
              duration: 0.7,
            }}
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path d="M18 6L6 18" />
            <motion.path d="M6 6L18 18" />
          </motion.svg>
        </motion.div>

        {/* TEXTO */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1,
            duration: 0.6,
          }}
          className="text-white text-5xl font-light mt-14 tracking-wide"
        >
          Pagamento Realizado
        </motion.h1>
        <motion.button
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.3, duration: 0.5 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => {
    window.location.href = "/";
  }}
  className="mt-10 px-8 py-4 bg-white text-[#8b7bbd] text-xl font-semibold rounded-2xl shadow-2xl transition-all"
>
  Fazer Nova Compra
</motion.button>
      </div>
    </div>
  );
}