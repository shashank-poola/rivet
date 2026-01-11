import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, Sparkles, Mail, MessageCircle } from "lucide-react";

type CredentialType = "gemini" | "grok" | "telegram" | "resend" | null;

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const credentialOptions = [
  { id: "gemini" as const, name: "Gemini", icon: Sparkles, description: "Google's AI model" },
  { id: "grok" as const, name: "Grok", icon: Bot, description: "xAI's conversational AI" },
  { id: "telegram" as const, name: "Telegram Bot", icon: MessageCircle, description: "Telegram bot integration" },
  { id: "resend" as const, name: "Resend Email", icon: Mail, description: "Email sending service" },
];

export function CredentialsDialog({ open, onOpenChange }: CredentialsDialogProps) {
  const [selectedType, setSelectedType] = useState<CredentialType>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleClose = () => {
    setSelectedType(null);
    setFormData({});
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedType(null);
    setFormData({});
  };

  const handleSave = () => {
    console.log("Saving credential:", selectedType, formData);
    handleClose();
  };

  const renderCredentialForm = () => {
    switch (selectedType) {
      case "gemini":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-foreground">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get your API key from Google AI Studio</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-foreground">Model (Optional)</Label>
              <Input
                id="model"
                placeholder="gemini-pro"
                value={formData.model || ""}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>
        );
      case "grok":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-foreground">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Grok API key"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get your API key from xAI console</p>
            </div>
          </div>
        );
      case "telegram":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-token" className="text-foreground">Bot Token</Label>
              <Input
                id="bot-token"
                type="password"
                placeholder="Enter your Telegram bot token"
                value={formData.botToken || ""}
                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get the token from @BotFather on Telegram</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bot-name" className="text-foreground">Bot Name</Label>
              <Input
                id="bot-name"
                placeholder="Enter your bot's username"
                value={formData.botName || ""}
                onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat-id" className="text-foreground">Chat ID (Optional)</Label>
              <Input
                id="chat-id"
                placeholder="Enter the default chat ID"
                value={formData.chatId || ""}
                onChange={(e) => setFormData({ ...formData, chatId: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">The chat ID to send messages to by default</p>
            </div>
          </div>
        );
      case "resend":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-foreground">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Resend API key"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">Get your API key from the Resend dashboard</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email" className="text-foreground">From Email</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="noreply@yourdomain.com"
                value={formData.fromEmail || ""}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">The email address to send from</p>
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
              ? `Configure ${credentialOptions.find(c => c.id === selectedType)?.name}` 
              : "Add Credential"}
          </DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="grid grid-cols-2 gap-3 py-4">
            {credentialOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:bg-selected hover:border-primary/50 transition-colors text-center"
              >
                <option.icon className="h-8 w-8 text-primary" />
                <span className="font-medium text-foreground">{option.name}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-4">
            {renderCredentialForm()}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Credential
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
