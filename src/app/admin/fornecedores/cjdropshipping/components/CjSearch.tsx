"use client";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

type Props = {
  value: string;
  loading: boolean;

  onChange: (value: string) => void;

  onSearch: () => void;
};

export default function CjSearch({
  value,
  loading,
  onChange,
  onSearch,
}: Props) {

  
  return (
    <div className="flex gap-3">

      <Input
        value={value}
        placeholder="Pesquisar produto..."
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

      <Button
        disabled={loading}
        onClick={onSearch}
      >
        {loading
          ? "Pesquisando..."
          : "Pesquisar"}
      </Button>

    </div>
    
  );
}