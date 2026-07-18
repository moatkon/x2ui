"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  name: string;
  image?: string;
  src?: string;
  sizeClass?: string;
};

export function Avatar({ name, image, src, sizeClass = "size-10" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const imageSource = src || (image ? `/assets/avatars/${image}.svg` : undefined);
  if (!imageSource || failed) {
    return (
      <div className={`avatar placeholder ${sizeClass} shrink-0`}>
        <div className="rounded-full bg-neutral text-neutral-content">
          <span aria-label={`${name}的头像`}>{name.trim().slice(0, 1).toUpperCase() || "?"}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`avatar ${sizeClass} shrink-0 overflow-hidden rounded-full`}>
      <Image src={imageSource} alt={`${name}的头像`} width={96} height={96} sizes="96px" onError={() => setFailed(true)} />
    </div>
  );
}
