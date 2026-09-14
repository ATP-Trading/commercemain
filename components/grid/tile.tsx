"use client";

import type React from "react";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import Label from "../label";

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
    isATPMember?: boolean;
  };
} & React.ComponentProps<typeof Image>) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={clsx(
        "group relative flex h-full w-full items-center justify-center overflow-hidden",
        "bg-atp-white border border-atp-light-gray rounded-lg shadow-sm",
        "transition-all duration-500 ease-out",
        "hover:shadow-xl hover:shadow-atp-black/10 hover:border-atp-gold/30",
        {
          relative: label,
          "border-2 border-atp-gold shadow-lg shadow-atp-gold/20": active,
        }
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-atp-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />


      {label?.isATPMember && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-atp-gold text-atp-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
            ATP Member
          </div>
        </div>
      )}

      {props.src ? (
        <div className="relative w-full h-full overflow-hidden">
          <Image
            className={clsx(
              "relative h-full w-full object-cover transition-all duration-700 ease-out",
              {
                "group-hover:scale-110": isInteractive,
                "opacity-0": !imageLoaded,
                "opacity-100": imageLoaded,
              }
            )}
            onLoad={() => setImageLoaded(true)}
            {...props}
          />

          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-atp-light-gray via-atp-off-white to-atp-light-gray animate-pulse" />
          )}
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-atp-light-gray to-atp-off-white flex items-center justify-center">
          <div className="text-atp-charcoal/40 text-sm font-medium">
            No Image
          </div>
        </div>
      )}

      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
          isATPMember={label.isATPMember}
        />
      ) : null}
    </div>
  );
}
