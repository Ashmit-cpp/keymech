import { Button } from "@/components/ui/button";
import { KeyboardAsideSection } from "@/components/keyboard-aside-section";

const specs = [
  { label: "Polling", value: "1000 Hz" },
  { label: "Layout", value: "75% gasket" },
  { label: "Connectivity", value: "USB-C / BT 5.2" },
];

export default function SpecsSection() {
  return (
    <KeyboardAsideSection>
      <div>
        <span className="mb-5 inline-block rounded-full border border-border bg-muted/40 px-3 py-1 text-[10px] font-bold tracking-widest text-muted-foreground">
          SPECS
        </span>
        <h2 className="mb-3 font-['Syne'] text-3xl font-bold text-foreground md:text-4xl">
          Built to spec
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Numbers that matter for daily drivers: stable firmware, low latency,
          and hardware you can swap without a soldering iron.
        </p>
      </div>

      <dl className="grid gap-3 rounded-xl border border-border bg-card/50 p-4 sm:grid-cols-3">
        {specs.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <Button variant="outline" className="w-fit">
        Full datasheet
      </Button>
    </KeyboardAsideSection>
  );
}
