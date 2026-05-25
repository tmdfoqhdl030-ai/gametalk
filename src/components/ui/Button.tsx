"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    ghost: "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
