"use client";

type CartHeaderProps = {
  checked: boolean;
  selected: number;
  onChange: () => void;
};

export function CartHeader({
  checked,
  selected,
  onChange,
}: CartHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
        />

        Selecionar todos
      </label>

      <span className="text-sm font-semibold text-slate-700">
        {selected} itens selecionados
      </span>
    </div>
  );
}