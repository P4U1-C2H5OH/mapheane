import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CartIconProps {
  onClick: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { getCartCount } = useCart();
  const count = getCartCount();

  return (
    <button
      onClick={onClick}
      className="relative group text-charcoal hover:text-terracotta transition-colors duration-300"
      aria-label="Shopping Cart"
    >
      <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
      
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-terracotta text-white rounded-full flex items-center justify-center text-xs font-medium"
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
