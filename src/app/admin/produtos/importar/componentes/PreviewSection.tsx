import PreviewCards from "./PreviewCards";
import PreviewTable from "./PreviewTable";

interface Props {

  mostrar: boolean;

  preview: any[];

}

export default function PreviewSection({

  mostrar,

  preview,

}: Props) {

  if (!mostrar) {

    return null;

  }

  return (

    <div
      className="
      mt-8
      overflow-hidden
      rounded-2xl
      border
      bg-white
      shadow-sm
    "
    >

      <PreviewCards
        preview={preview}
      />

      <PreviewTable
        preview={preview}
      />

    </div>

  );

}