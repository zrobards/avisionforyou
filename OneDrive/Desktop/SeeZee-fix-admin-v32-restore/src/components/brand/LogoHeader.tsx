"use client";

import Link from "next/link";

interface LogoHeaderProps {
  href?: string;
  className?: string;
}

export function LogoHeader({ href = "/", className }: LogoHeaderProps) {
  const content = (
    <div
      className={`group flex items-center justify-center gap-1.5 font-heading font-bold uppercase tracking-[0.08em] ${className ?? ""}`.trim()}
    >
      <span className="text-lg sm:text-xl text-white transition-colors duration-300 group-hover:text-trinity-red">
        SEE
      </span>
      <span className="inline-flex items-center rounded-full bg-trinity-red px-3 py-1 text-[0.65rem] font-semibold tracking-[0.1em] text-white transition-colors duration-300 group-hover:bg-white group-hover:text-trinity-red">
        STUDIO
      </span>
      <span className="text-lg sm:text-xl text-white transition-colors duration-300 group-hover:text-trinity-red">
        ZEE
      </span>
    </div>
  );

  if (!href) {
    return <div className="flex h-full items-center justify-center">{content}</div>;
  }

  return (
    <Link href={href} className="flex h-full items-center justify-center">
      {content}
    </Link>
  );
}

export default LogoHeader;




















