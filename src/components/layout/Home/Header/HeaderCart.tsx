import Image from "next/image";
import Link from "next/link";
import cartIcon from "@/public/imagens/icons/cart.png";

export default function HeaderCart() {
  return (
    <Link
      href="/carrinho"
      className="
          flex items-center gap-2
          rounded-full
          border border-white/20
          bg-white/10
          px-5 py-2
          text-sm font-semibold
          text-white
          backdrop-blur-md
          transition-all
          hover:bg-white/15
          hover:border-white/30
      "
    >
      <Image
        src={cartIcon}
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 object-contain"
      />
      <span>Carrinho</span>
    </Link>
  );
}
