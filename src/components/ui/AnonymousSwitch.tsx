import { Switch } from "@base-ui/react/switch";

type AnonymousSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function AnonymousSwitch({ checked, onCheckedChange }: AnonymousSwitchProps) {
  return (
    <Switch.Root
      className="switch-root"
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label="匿名參與"
    >
      <Switch.Thumb className="switch-thumb" />
    </Switch.Root>
  );
}
