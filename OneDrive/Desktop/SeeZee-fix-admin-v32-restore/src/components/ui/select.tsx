import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value || "");

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, value: internalValue, onValueChange: handleValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

const SelectContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
}>({
  open: false,
  setOpen: () => {},
  value: "",
  onValueChange: () => {},
});

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});

SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ className, children, ...props }, ref) => {
  const { open } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-lg",
        className
      )}
      {...props}
    >
      <div className="max-h-60 overflow-y-auto p-1">{children}</div>
    </div>
  );
});

SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { onValueChange, value: selectedValue } = React.useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onValueChange(value)}
        className={cn(
          "w-full rounded px-2 py-1.5 text-left text-sm text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none",
          selectedValue === value && "bg-white/5",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SelectItem.displayName = "SelectItem";
