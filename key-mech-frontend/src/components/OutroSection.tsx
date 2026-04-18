import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { KeyboardAsideSection } from "@/components/keyboard-aside-section";

export default function OutroSection() {
  const navigate = useNavigate();

  return (
    <KeyboardAsideSection>
      <div>
        <span className="mb-5 inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold tracking-widest text-primary">
          KEYMECH
        </span>
        <h2 className="mb-3 font-['Syne'] text-3xl font-bold text-foreground md:text-4xl">
          Ready when you are
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          From first switch tester to endgame board — browse in-stock kits or
          plan your next build with us.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          className="group"
          onClick={() => navigate("/category/keyboards")}
        >
          Shop keyboards
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Browse catalog
        </Button>
      </div>
    </KeyboardAsideSection>
  );
}
