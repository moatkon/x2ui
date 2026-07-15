type AvatarProps = {
  name: string;
  image: string;
  sizeClass?: string;
};

export function Avatar({ name, image, sizeClass = "size-10" }: AvatarProps) {
  return (
    <div className={`avatar ${sizeClass} shrink-0 overflow-hidden rounded-full`}>
      <Image src={`/assets/avatars/${image}.svg`} alt={`${name}的头像`} width={96} height={96} sizes="96px" />
    </div>
  );
}
import Image from "next/image";
