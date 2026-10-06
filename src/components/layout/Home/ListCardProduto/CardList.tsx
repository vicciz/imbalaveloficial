export default function CardList() {

const cards = [
 {
   image:"/imagens/Banners/card1.jpg"
 },
 {
   image:"/imagens/Banners/card2.jpg"
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
  "
>


<h2 className="mb-3 text-sm font-semibold">
Benefícios da Imbalavel
</h2>

<div
 className="
 flex
 gap-6
 overflow-hidden
 "
>

{cards.map((card,index)=>(

<div
 key={index}
 className="
   h-[265px]
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