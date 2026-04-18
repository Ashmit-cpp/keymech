import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const categories = [
  {
    id: "SW",
    label: "Switches",
    meta: "32 varieties",
    desc: "Linear, tactile, clicky",
    slug: "switches",
  },
  {
    id: "KC",
    label: "Keycaps",
    meta: "120+ sets",
    desc: "PBT, POM, artisan singles",
    slug: "keycaps",
  },
  {
    id: "CA",
    label: "Cases",
    meta: "Aluminum · Poly",
    desc: "60%, 65%, 75%, TKL",
    slug: "cases",
  },
  {
    id: "AC",
    label: "Accessories",
    meta: "Cables · Lube · Foam",
    desc: "Everything else you need",
    slug: "accessories",
  },
];

export default function CategorySection() {
  const navigate = useNavigate();

  return (
    <section className="relative border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-10 py-24 md:py-32">
        <div className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <Badge
              variant="secondary"
              className="mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Components
            </Badge>

            <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-tight">
              Shop by{" "}
              <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Category
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Everything you need to build or upgrade your board.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.05, duration: 0.55, ease: EASE_OUT }}
            className="shrink-0 self-start md:self-auto"
          >
            <Button
              size="lg"
              variant="secondary"
              className="group whitespace-nowrap"
              onClick={() => navigate("/products")}
            >
              Browse entire store
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                delay: i * 0.08,
                duration: 0.55,
                ease: EASE_OUT,
              }}
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-md"
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-xs font-bold text-muted-foreground shadow-inner transition-colors duration-200 group-hover:border-primary/40 group-hover:text-foreground">
                {cat.id}
              </div>
              <div className="mb-1 text-[15px] font-semibold text-foreground">
                {cat.label}
              </div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                {cat.meta}
              </div>
              <div className="text-xs text-muted-foreground/80 transition-colors group-hover:text-muted-foreground">
                {cat.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
