import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Github, MessageCircle, Mail, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { credentialsApi, type CredentialDto, type Platform } from '@/lib/api';

interface Credential extends CredentialDto {
  createdAt?: Date;
}

const Credentials: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCredential, setNewCredential] = useState({
    title: '',
    platform: 'email' as Platform,
    data: {} as Record<string, string>,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await credentialsApi.list();
        setCredentials(res.credentials as Credential[]);
      } catch (e) {
        // ignore for now
      }
    })();
  }, []);

  const handleAddCredential = async () => {
    if (!newCredential.title || !newCredential.platform) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await credentialsApi.create(newCredential);
      const res = await credentialsApi.list();
      setCredentials(res.credentials as Credential[]);
      setNewCredential({ title: '', platform: 'email', data: {} });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Credential added successfully" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to add credential", variant: 'destructive' });
    }
  };

  const getIcon = (platform: Platform) => {
    switch (platform) {
      case 'telegram':
        return <MessageCircle className="h-5 w-5" />;
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'email':
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
                  <Label htmlFor="name">Title</Label>
                  <Input
                    id="name"
                    value={newCredential.title}
                    onChange={(e) => setNewCredential({...newCredential, title: e.target.value})}
                    placeholder="My Email API"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={newCredential.platform}
                    onChange={(e) => setNewCredential({...newCredential, platform: e.target.value as Platform})}
                  >
                    <option value="email">Email</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                
                {/* Simple key/value for demo */}
                <div>
                  <Label htmlFor="k">Config Key</Label>
                  <Input id="k" placeholder="e.g. apiKey or token" onChange={(e) => setNewCredential({ ...newCredential, data: { ...newCredential.data, key: e.target.value } })} />
                </div>
                <div>
                  <Label htmlFor="v">Config Value</Label>
                  <Input id="v" type="password" placeholder="secret value" onChange={(e) => setNewCredential({ ...newCredential, data: { ...newCredential.data, value: e.target.value } })} />
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
                      {getIcon(credential.platform)}
                      {credential.title}
                    </CardTitle>
                    <CardDescription>
                      Type: {credential.platform}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {credential.createdAt ? `Added: ${credential.createdAt.toLocaleDateString()}` : null}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={async () => {
                          await credentialsApi.remove(credential.id);
                          const res = await credentialsApi.list();
                          setCredentials(res.credentials as Credential[]);
                        }}
                      >
                        Delete
                      </Button>
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