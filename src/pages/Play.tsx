import { useSearchParams } from "react-router-dom";
import { Game } from "@/components/Game";

export default function Play() {
  const [searchParams] = useSearchParams();
  const sportFilter = searchParams.get("sport");

  return <Game sportFilter={sportFilter} />;
}
