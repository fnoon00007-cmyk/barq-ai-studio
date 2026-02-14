import logoLight from "@/assets/logo-light.jpg";

interface BarqLogoProps {
  size?: number;
  className?: string;
}

export default function BarqLogo({ size = 36, className = "" }: BarqLogoProps) {
  return (
    <img
      src={logoLight}
      alt="Barq Ai Logo"
      width={size}
      height={size}
      className={`rounded-xl object-contain ${className}`}
    />
  );
}
