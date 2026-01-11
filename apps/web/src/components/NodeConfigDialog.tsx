import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type NodeType = "form" | "email" | "telegram" | "ai-agent" | null;

interface FormField {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
}

interface NodeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeType: NodeType;
  onSave: (config: Record<string, unknown>) => void;
}

export function NodeConfigDialog({ open, onOpenChange, nodeType, onSave }: NodeConfigDialogProps) {
  const [formConfig, setFormConfig] = useState({
    title: "Fill out this form",
    description: "Please fill out all required fields",
    submitButtonText: "Submit",
    fields: [
      { id: "1", name: "Name", type: "Text", placeholder: "Enter your name", required: true }
    ] as FormField[]
  });

  const [emailConfig, setEmailConfig] = useState({
    to: "",
    subject: "",
    body: "",
    fromName: ""
  });

  const [telegramConfig, setTelegramConfig] = useState({
    chatId: "",
    message: "",
    parseMode: "HTML"
  });

  const [aiConfig, setAiConfig] = useState({
    model: "gemini-pro",
    prompt: "",
    maxTokens: "1024",
    temperature: "0.7"
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    let config: Record<string, unknown> = {};
    switch (nodeType) {
      case "form":
        config = formConfig;
        break;
      case "email":
        config = emailConfig;
        break;
      case "telegram":
        config = telegramConfig;
        break;
      case "ai-agent":
        config = aiConfig;
        break;
    }
    onSave(config);
    handleClose();
  };

  const addFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: "",
      type: "Text",
      placeholder: "",
      required: false
    };
    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeFormField = (id: string) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id)
    }));
  };

  const updateFormField = (id: string, updates: Partial<FormField>) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const getTitle = () => {
    switch (nodeType) {
      case "form": return "Configure Form";
      case "email": return "Configure Email Service";
      case "telegram": return "Configure Telegram Bot";
      case "ai-agent": return "Configure AI Agent";
      default: return "Configure Node";
    }
  };

  const renderFormConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="form-title" className="text-foreground">Form Title</Label>
        <Input
          id="form-title"
          value={formConfig.title}
          onChange={(e) => setFormConfig(prev => ({ ...prev, title: e.target.value }))}
          className="bg-muted border-border"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="form-description" className="text-foreground">Form Description (optional)</Label>
        <textarea
          id="form-description"
          value={formConfig.description}
          onChange={(e) => setFormConfig(prev => ({ ...prev, description: e.target.value }))}
          className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-border bg-muted text-foreground resize-y"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="submit-text" className="text-foreground">Submit Button Text</Label>
        <Input
          id="submit-text"
          value={formConfig.submitButtonText}
          onChange={(e) => setFormConfig(prev => ({ ...prev, submitButtonText: e.target.value }))}
          className="bg-muted border-border"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">Form Attributes</Label>
          <Button variant="outline" size="sm" onClick={addFormField} className="gap-1">
            <Plus className="h-3 w-3" />
            Add Field
          </Button>
        </div>
        <div className="space-y-4 max-h-[250px] overflow-y-auto border border-border rounded-lg p-4 bg-muted/50">
          {formConfig.fields.map((field, index) => (
            <div key={field.id} className="space-y-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Field {index + 1}</span>
                <button 
                  onClick={() => removeFormField(field.id)}
                  className="text-destructive hover:text-destructive/80 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Field Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateFormField(field.id, { name: e.target.value })}
                  placeholder="Name"
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Field Type</Label>
                  <select
                    value={field.type}
                    onChange={(e) => updateFormField(field.id, { type: e.target.value })}
                    className="w-full h-9 px-3 text-sm rounded-md border border-border bg-muted text-foreground"
                  >
                    <option value="Text">Text</option>
                    <option value="Email">Email</option>
                    <option value="Number">Number</option>
                    <option value="Textarea">Textarea</option>
                    <option value="Select">Select</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Placeholder</Label>
                  <Input
                    value={field.placeholder}
                    onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                    placeholder="Enter your name"
                    className="bg-muted border-border"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground">Required field</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmailConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-to" className="text-foreground">To Email</Label>
        <Input
          id="email-to"
          type="email"
          value={emailConfig.to}
          onChange={(e) => setEmailConfig(prev => ({ ...prev, to: e.target.value }))}
          placeholder="recipient@example.com"
          className="bg-muted border-border"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-from" className="text-foreground">From Name</Label>
        <Input
          id="email-from"
          value={emailConfig.fromName}
          onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
          placeholder="Your Name or Company"
          className="bg-muted border-border"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-subject" className="text-foreground">Subject</Label>
        <Input
          id="email-subject"
          value={emailConfig.subject}
          onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Email subject"
          className="bg-muted border-border"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-body" className="text-foreground">Body</Label>
        <textarea
          id="email-body"
          value={emailConfig.body}
          onChange={(e) => setEmailConfig(prev => ({ ...prev, body: e.target.value }))}
          placeholder="Email content..."
          className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-border bg-muted text-foreground resize-y"
        />
      </div>
    </div>
  );

  const renderTelegramConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="telegram-chat" className="text-foreground">Chat ID</Label>
        <Input
          id="telegram-chat"
          value={telegramConfig.chatId}
          onChange={(e) => setTelegramConfig(prev => ({ ...prev, chatId: e.target.value }))}
          placeholder="Enter chat ID"
          className="bg-muted border-border"
        />
        <p className="text-xs text-muted-foreground">The chat ID to send messages to</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="telegram-message" className="text-foreground">Message</Label>
        <textarea
          id="telegram-message"
          value={telegramConfig.message}
          onChange={(e) => setTelegramConfig(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Message content..."
          className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-border bg-muted text-foreground resize-y"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telegram-parse" className="text-foreground">Parse Mode</Label>
        <select
          id="telegram-parse"
          value={telegramConfig.parseMode}
          onChange={(e) => setTelegramConfig(prev => ({ ...prev, parseMode: e.target.value }))}
          className="w-full h-9 px-3 text-sm rounded-md border border-border bg-muted text-foreground"
        >
          <option value="HTML">HTML</option>
          <option value="Markdown">Markdown</option>
          <option value="MarkdownV2">MarkdownV2</option>
        </select>
      </div>
    </div>
  );

  const renderAiConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ai-model" className="text-foreground">Model</Label>
        <select
          id="ai-model"
          value={aiConfig.model}
          onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
          className="w-full h-9 px-3 text-sm rounded-md border border-border bg-muted text-foreground"
        >
          <option value="gemini-pro">Gemini Pro</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="grok-1">Grok 1</option>
          <option value="grok-2">Grok 2</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ai-prompt" className="text-foreground">System Prompt</Label>
        <textarea
          id="ai-prompt"
          value={aiConfig.prompt}
          onChange={(e) => setAiConfig(prev => ({ ...prev, prompt: e.target.value }))}
          placeholder="Enter system prompt or instructions..."
          className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-border bg-muted text-foreground resize-y"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ai-tokens" className="text-foreground">Max Tokens</Label>
          <Input
            id="ai-tokens"
            type="number"
            value={aiConfig.maxTokens}
            onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: e.target.value }))}
            className="bg-muted border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ai-temp" className="text-foreground">Temperature</Label>
          <Input
            id="ai-temp"
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={aiConfig.temperature}
            onChange={(e) => setAiConfig(prev => ({ ...prev, temperature: e.target.value }))}
            className="bg-muted border-border"
          />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (nodeType) {
      case "form": return renderFormConfig();
      case "email": return renderEmailConfig();
      case "telegram": return renderTelegramConfig();
      case "ai-agent": return renderAiConfig();
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
