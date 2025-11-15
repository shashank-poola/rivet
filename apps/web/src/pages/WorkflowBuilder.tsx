import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Save, Play, Plus, Mail, Brain, FileText, X, Settings, Copy, Trash2, Search, Link, Sparkles, MessageCircle, FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// edit and build custom node
const CustomNode = ({ data, selected }: NodeProps) => {
  const Icon = data.icon || FileText;
  const isStartNode = data.type === 'trigger';
  
  return (
    <div
      className={`
        relative min-w-[280px] rounded-xl border-2 transition-all duration-200
        ${selected 
          ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
          : 'border-border hover:border-primary/50 hover:shadow-md'
        }
        ${isStartNode ? 'bg-gradient-to-br from-primary/10 to-primary/5' : 'bg-card'}
      `}
    >
      {!isStartNode && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`
            p-2.5 rounded-lg flex-shrink-0
            ${isStartNode 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-accent text-accent-foreground'
            }
          `}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {data.label}
              </h3>
              {isStartNode && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  START
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {data.description}
            </p>
          </div>
        </div>
        
        {data.status && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full
                ${data.status === 'success' ? 'bg-green-500' : ''}
                ${data.status === 'running' ? 'bg-blue-500 animate-pulse' : ''}
                ${data.status === 'error' ? 'bg-red-500' : ''}
              `} />
              <span className="text-xs text-muted-foreground capitalize">
                {data.status}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-lg">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTemplates = [
  {
    category: 'Triggers',
    items: [
      {
        id: 'manual-trigger',
        label: 'Manual Trigger',
        description: 'Start workflow manually with a button click',
        icon: Play,
        type: 'trigger',
      },
      {
        id: 'webhook',
        label: 'Webhook',
        description: 'Trigger workflow via HTTP POST request',
        icon: Link,
        type: 'trigger',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        description: 'Run workflow on a recurring schedule',
        icon: Sparkles,
        type: 'trigger',
      },
    ],
  },
  {
    category: 'Actions',
    items: [
      {
        id: 'form',
        label: 'Form',
        description: 'Collect and validate user input data',
        icon: FileText,
        type: 'node',
      },
      {
        id: 'email',
        label: 'Email Service',
        description: 'Send transactional or marketing emails',
        icon: Mail,
        type: 'node',
      },
      {
        id: 'telegram',
        label: 'Telegram Bot',
        description: 'Send messages and notifications via Telegram',
        icon: MessageCircle,
        type: 'node',
      },
    ],
  },
  {
    category: 'AI & Automation',
    items: [
      {
        id: 'ai-agent',
        label: 'AI Agent',
        description: 'Process data with AI and machine learning',
        icon: Brain,
        type: 'node',
      },
    ],
  },
];

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeSelector, setShowNodeSelector] = useState(true);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        animated: true,
        style: { stroke: 'hsl(var(--primary))' },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addNode = (template: any) => {
    const newNode: Node = {
      id: `${template.id}-${Date.now()}`,
      type: 'custom',
      position: { 
        x: 250 + Math.random() * 100, 
        y: 100 + nodes.length * 150 
      },
      data: { 
        label: template.label,
        description: template.description,
        icon: template.icon,
        type: template.type,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeSelector(false);
  };

  const handleSave = () => {
    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    });
  };

  const handleExecute = () => {
    toast({
      title: "Workflow executing",
      description: "Your workflow is now running.",
    });
  };

  const filteredTemplates = useMemo(() => {
    return nodeTemplates.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(category => category.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-2 w-64"
            />
          </div>
          <Badge variant="outline" className="ml-2">
            {nodes.length} nodes
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleExecute}>
            <Play className="h-4 w-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 2 },
          }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1} 
            color="hsl(var(--muted-foreground) / 0.2)"
          />
          <Controls 
            className="bg-card border border-border rounded-lg shadow-lg"
          />
          
          {/* Add Node Button */}
          <Panel position="top-right">
            <Button
              onClick={() => setShowNodeSelector(!showNodeSelector)}
              className="bg-primary hover:bg-primary/90 shadow-lg"
              size="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </Panel>

          {/* Quick Stats Panel */}
          {nodes.length > 0 && (
            <Panel position="bottom-left">
              <Card className="p-3 bg-card/95 backdrop-blur-sm border-border shadow-lg">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Nodes:</span>
                    <span className="ml-1 font-semibold text-foreground">{nodes.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Connections:</span>
                    <span className="ml-1 font-semibold text-foreground">{edges.length}</span>
                  </div>
                </div>
              </Card>
            </Panel>
          )}
        </ReactFlow>

        {/* Node Selector Panel */}
        {showNodeSelector && (
          <Card className="absolute left-8 top-8 w-[420px] bg-card/95 backdrop-blur-xl border-border shadow-2xl z-10 max-h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Add to Workflow</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a component to add to your workflow
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNodeSelector(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Node Templates */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {filteredTemplates.map((category) => (
                <div key={category.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {category.category}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {category.items.length} available
                    </span>
                  </div>
                  
                  <div className="grid gap-2">
                    {category.items.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => addNode(template)}
                          className="group relative w-full text-left p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              p-2 rounded-lg flex-shrink-0 transition-colors
                              ${template.type === 'trigger' 
                                ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' 
                                : 'bg-accent text-accent-foreground group-hover:bg-primary/10 group-hover:text-primary'
                              }
                            `}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm text-foreground">
                                  {template.label}
                                </h4>
                                {template.type === 'trigger' && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                    TRIGGER
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-4 w-4 text-primary" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No nodes found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {nodes.length === 0 && !showNodeSelector && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start Building Your Workflow
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Click the "Add Node" button to add triggers and actions to your workflow
              </p>
              <Button
                onClick={() => setShowNodeSelector(true)}
                className="pointer-events-auto bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Node
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;