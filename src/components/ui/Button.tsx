import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-bold rounded-xl border-2 retro-press transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-peach border-tan text-brown hover:bg-tan hover:text-cream warm-shadow-sm",
      secondary:
        "bg-cream border-tan text-brown hover:bg-peach/30 warm-shadow-sm",
      ghost: "bg-transparent border-transparent text-brown-light hover:bg-peach/10",
      danger: "bg-rose border-rose text-cream hover:bg-rose/80 warm-shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-7 py-3.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
