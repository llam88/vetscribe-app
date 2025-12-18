import Image from "next/image";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Image
      src="/favOffWhite.png"
      alt="SwiftVet"
      width={24}
      height={24}
      className={`h-10 w-10 ${className}`}
      priority
    />
  );
}