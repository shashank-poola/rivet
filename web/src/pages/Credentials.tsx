import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Github, MessageCircle, Mail, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Credential {
  id: string;
  name: string;
  type: 'github' | 'telegram' | 'whatsapp' | 'gmail';
  apiKey: string;
  createdAt: Date;
}

const Credentials: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCredential, setNewCredential] = useState({
    name: '',
    type: 'github' as Credential['type'],
    apiKey: ''
  });

  const handleAddCredential = () => {
    if (!newCredential.name || !newCredential.apiKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const credential: Credential = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCredential,
      createdAt: new Date()
    };

    setCredentials([...credentials, credential]);
    setNewCredential({ name: '', type: 'github', apiKey: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Credential added successfully"
    });
  };

  const getIcon = (type: Credential['type']) => {
    switch (type) {
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'telegram':
        return <MessageCircle className="h-5 w-5" />;
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'gmail':
        return <Mail className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-surface">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Credentials</h1>
            <p className="text-sm text-muted-foreground">Manage your API keys and integrations</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Credential
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Credential</DialogTitle>
                <DialogDescription>
                  Add API keys for your integrations
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newCredential.name}
                    onChange={(e) => setNewCredential({...newCredential, name: e.target.value})}
                    placeholder="My GitHub API"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={newCredential.type}
                    onChange={(e) => setNewCredential({...newCredential, type: e.target.value as Credential['type']})}
                  >
                    <option value="github">GitHub</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="gmail">Gmail</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={newCredential.apiKey}
                    onChange={(e) => setNewCredential({...newCredential, apiKey: e.target.value})}
                    placeholder="Enter your API key"
                  />
                </div>
                
                <Button onClick={handleAddCredential} className="w-full">
                  Add Credential
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {credentials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No credentials configured yet.<br />
                Add your first API key to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentials.map((credential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getIcon(credential.type)}
                      {credential.name}
                    </CardTitle>
                    <CardDescription>
                      Type: {credential.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Added: {credential.createdAt.toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Credentials;