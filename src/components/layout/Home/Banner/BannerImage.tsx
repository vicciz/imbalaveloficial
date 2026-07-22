import Image from "next/image";

type Props = {
  image: string;
};

export default function BannerImage({
  image,
}: Props) {
  return (
    <Image
      src={image}
      alt="Banner"
      width={1920}
      height={500}
      priority
      className="
        h-full
        w-full
        object-cover
        object-center
      "
    />
  );
}