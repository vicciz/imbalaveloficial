import CarrosselCosmeticos from '../page-inicio/carrossel';

export default function Outros() {
  return (
    <section className="py-14 animate-fadeUp">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center">Mais Vendidos</h2>
        <p className="text-center text-[#56719a] mt-2">Top escolhas da curadoria</p>
        <div className="mt-8 flex justify-center">
          <div className="w-full">
            <CarrosselCosmeticos />
          </div>
        </div>
      </div>
    </section>
  );
}