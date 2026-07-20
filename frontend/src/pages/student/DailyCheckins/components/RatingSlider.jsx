import { Label } from "../../../../components/ui/label";

export default function RatingSlider({ id, label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-sm font-semibold text-primary">
          {value === "" || value === undefined ? "-" : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value === "" || value === undefined ? 0 : value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>10</span>
      </div>
    </div>
  );
}
