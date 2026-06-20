import { Moon, Sun } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function SettingsPage() {
  return (
    <Card className="max-w-2xl">
      <h2 className="mb-4 text-xl font-bold">Settings</h2>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => document.documentElement.classList.add("dark")}><Moon size={16} /> Dark</Button>
        <Button variant="secondary" onClick={() => document.documentElement.classList.remove("dark")}><Sun size={16} /> Light</Button>
      </div>
    </Card>
  );
}
