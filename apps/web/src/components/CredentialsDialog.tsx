import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, Mail, MessageCircle, Coins, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

type CredentialType = "openai" | "telegram" | "resend" | "solana" | "whatsapp" | null;

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const credentialOptions = [
  { id: "openai" as const, name: "OpenAI", icon: Bot, description: "GPT models via OpenAI API" },
  { id: "telegram" as const, name: "Telegram Bot", icon: MessageCircle, description: "Telegram bot integration" },
  { id: "resend" as const, name: "Resend Email", icon: Mail, description: "Email sending service" },
  { id: "solana" as const, name: "Solana", icon: Coins, description: "Solana blockchain wallet" },
  { id: "whatsapp" as const, name: "WhatsApp", icon: Phone, description: "WhatsApp Business API" },
];

export function CredentialsDialog({ open, onOpenChange, onSaved }: CredentialsDialogProps) {
  const [selectedType, setSelectedType] = useState<CredentialType>(null);
  const [name, setName] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setSelectedType(null);
    setName("");
    setFormData({});
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedType(null);
    setName("");
    setFormData({});
  };

  const handleSave = async () => {
    if (!selectedType || !name.trim()) return;

    // Build the data payload matching the backend schema
    let data: Record<string, string> = {};
    if (selectedType === "openai") data = { apikey: formData.apikey ?? "" };
    if (selectedType === "telegram") data = { apikey: formData.apikey ?? "" };
    if (selectedType === "resend") data = { apikey: formData.apikey ?? "" };
    if (selectedType === "solana") data = { privateKey: formData.privateKey ?? "" };
    if (selectedType === "whatsapp") data = {
      accessToken: formData.accessToken ?? "",
      businessAccountId: formData.businessAccountId ?? "",
    };

    setSaving(true);
    try {
      await api.createCredential({ name: name.trim(), application: selectedType, data });
      toast.success("Credential saved successfully");
      onSaved?.();
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save credential");
    } finally {
      setSaving(false);
    }
  };

  const renderCredentialForm = () => {
    switch (selectedType) {
      case "openai":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">API Key</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={formData.apikey || ""}
                onChange={(e) => setFormData({ ...formData, apikey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get your key from platform.openai.com</p>
            </div>
          </div>
        );
      case "telegram":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Bot Token</Label>
              <Input
                type="password"
                placeholder="123456:ABC-DEF..."
                value={formData.apikey || ""}
                onChange={(e) => setFormData({ ...formData, apikey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get the token from @BotFather on Telegram</p>
            </div>
          </div>
        );
      case "resend":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">API Key</Label>
              <Input
                type="password"
                placeholder="re_..."
                value={formData.apikey || ""}
                onChange={(e) => setFormData({ ...formData, apikey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get your key from resend.com/api-keys</p>
            </div>
          </div>
        );
      case "solana":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Private Key (Base58)</Label>
              <Input
                type="password"
                placeholder="Your wallet private key..."
                value={formData.privateKey || ""}
                onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Base58-encoded private key for your Solana wallet</p>
            </div>
          </div>
        );
      case "whatsapp":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Access Token</Label>
              <Input
                type="password"
                placeholder="EAABs..."
                value={formData.accessToken || ""}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Business Account ID</Label>
              <Input
                placeholder="123456789..."
                value={formData.businessAccountId || ""}
                onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {selectedType && (
              <Button variant="ghost" size="icon" className="h-6 w-6 mr-1" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {selectedType
              ? `Configure ${credentialOptions.find((c) => c.id === selectedType)?.name}`
              : "Add Credential"}
          </DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="grid grid-cols-2 gap-3 py-4">
            {credentialOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:bg-secondary hover:border-primary/50 transition-colors text-center"
              >
                <option.icon className="h-8 w-8 text-primary" />
                <span className="font-medium text-foreground">{option.name}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Credential Name</Label>
              <Input
                placeholder="e.g. My OpenAI Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            {renderCredentialForm()}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleBack}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? "Saving..." : "Save Credential"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
