import Image from "next/image";
import Link from "next/link";
import logo from "@/public/imagens/logo.png";

export default function HeaderLogo() {
  return (
    <Link href="/">
      <Image
        src={logo}
        alt="Imbalável"
       
      />
    </Link>
  );
}