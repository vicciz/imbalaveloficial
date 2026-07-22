import SearchBar from "@/src/components/search/SearchBar";

export default function HeaderSearch() {
  return (
    <SearchBar
      placeholder="Buscar produto"
      inputClassName="h-10 text-sm"
    />
  );
}