export default function CardList() {

const cards = [
 {
   image:"/imagens/Banners/card1.jpg"
 },
 {
   image:"/imagens/Banners/card2.png"
 },
 {
   image:"/imagens/Banners/card3.jpg"
 }
];


return (

<div
  className="
    mx-auto
    max-w-[1100px]
    rounded-xl
    bg-white
    p-4
    shadow-xl
    h-[210px]
  "
>


<h2 className="mb-3 text-sm font-semibold">
Benefícios em entretenimento
</h2>

<div
 className="
 flex
 gap-3
 overflow-hidden
 "
>

{cards.map((card,index)=>(

<div
 key={index}
 className="
   h-65
   flex-1
   overflow-hidden
   rounded-lg
 "
>

<img
src={card.image}
className="
h-full
w-full
object-cover
"
/>

</div>

))}

</div>


</div>

)

}