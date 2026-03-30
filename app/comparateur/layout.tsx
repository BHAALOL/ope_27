import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparateur",
  description: "Comparez les programmes et positions des candidats à la présidentielle 2027",
};

export default function ComparateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
