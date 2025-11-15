import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Workflow, Key, PlayCircle } from "lucide-react";
import profileBg from "@/assets/profile-bg.png";

const Personal = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  
  // Mock user data - will be replaced with actual auth
  const userEmail = "shashank@example.com";
  const userName = userEmail.split("@")[0].split(".").map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
  const userInitials = userName.split(" ").map(n => n[0]).join("");

  const handleCreateWorkflow = () => {
    if (workflowName.trim()) {
      navigate(`/personal/workflows/${Date.now()}`);
      setShowCreateDialog(false);
      setWorkflowName("");
    }
  };

  return (
    <div className="h-full w-full bg-background p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* User Profile */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 relative">
            <AvatarImage src={profileBg} alt="Profile background" className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{userName}</h1>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        {/* Workflows Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Workflows owned by you</h2>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <Workflow className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Workflows</h3>
              </div>
              <p className="text-sm text-muted-foreground">No workflows yet. Create your first workflow to get started.</p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Credentials</h3>
              </div>
              <p className="text-sm text-muted-foreground">No credentials configured yet.</p>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Executions</h3>
              </div>
              <p className="text-sm text-muted-foreground">No executions yet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Workflow className="h-5 w-5" />
              Create New Workflow
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name" className="text-foreground">Workflow Name</Label>
              <Input
                id="workflow-name"
                placeholder="Enter workflow name..."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkflow()}
                className="bg-background border-border"
              />
              <p className="text-sm text-muted-foreground">Choose a descriptive name for your workflow</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={!workflowName.trim()}>
              Create Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Personal;
