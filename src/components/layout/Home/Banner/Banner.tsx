import type { BannerData } from "./types";

import BannerImage from "./BannerImage";
import CardList from "../ListCardAd/CardList";


interface Props {
  banner: BannerData;
}


export default function Banner({
  banner,
}: Props) {


  return (

    <section
      className="
        w-full
      "
    >


      {/* BANNER */}

<div
  className="
    relative
    w-full
    h-[500px]
    overflow-hidden
  "
>
  <BannerImage image={banner.image} />
</div>



      {/* CARDS */}

<div
  className="
    relative
    z-20
    mx-auto
    -mt-12
    max-w-[1100px]
  "
>
  <CardList />
</div>

    </section>

  );

}