import type { AvatarState } from "@shc/contracts";

export const avatarImageSrc = import.meta.env.VITE_AVATAR_IMAGE_SRC ?? "/avatar/default-avatar.svg";
export const avatarImageAltText = "健康檢測助理";

interface AvatarImageProps {
  state: AvatarState;
}

export function AvatarImage({ state }: AvatarImageProps) {
  return (
    <img
      className={`avatar-image avatar-image-${state}`}
      src={avatarImageSrc}
      alt={avatarImageAltText}
      width="96"
      height="96"
    />
  );
}
