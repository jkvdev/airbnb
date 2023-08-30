"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  return (
    <Image
      onClick={() => router.push("/")}
      className="hidden md:block cursor-pointer object-contain"
      src="/images/logo.png"
      height="100"
      width="200"
      alt="Logo"
    />
  );
};

export default Logo;
