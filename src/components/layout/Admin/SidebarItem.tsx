import Link from "next/link";

type Props = {
  href: string;
  label: string;
  active?: boolean;
};

export default function SidebarItem({ href, label, active }: Props) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-4 py-3 transition ${
        active ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}