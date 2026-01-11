import { useState, useCallback } from 'react';
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
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Save, Play, Plus, Mail, MessageCircle, Bot, FileText, Zap, Webhook, MoreHorizontal, CheckCircle, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { NodeConfigDialog } from "@/components/NodeConfigDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ConfigNodeType = "form" | "email" | "telegram" | "ai-agent" | null;

interface NodeMenuProps {
  nodeId: string;
  label: string;
  onEdit: (nodeId: string, label: string) => void;
  onDelete: (nodeId: string) => void;
}

const NodeMenu = ({ nodeId, label, onEdit, onDelete }: NodeMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="p-1 hover:bg-muted rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(nodeId, label); }} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(nodeId); }} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Custom Node Components with enhanced selection styling
const TriggerNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-3 rounded-lg border shadow-sm min-w-[180px] transition-colors relative ${
      selected ? 'bg-selected border-l-[3px] border-l-primary border-t-border border-r-border border-b-border' : 'bg-card border-border'
    }`}>
      <Handle type="source" position={Position.Bottom} className="!bg-border !w-3 !h-3 !border-2 !border-background" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">do</span>
        <NodeMenu nodeId={data.nodeId} label={data.label} onEdit={data.onEdit} onDelete={data.onDelete} />
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary fill-primary" />
        <span className="font-medium text-foreground text-sm">{data.label}</span>
      </div>
    </div>
  );
};

const ActionNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-3 rounded-lg border shadow-sm min-w-[180px] transition-colors relative ${
      selected ? 'bg-selected border-l-[3px] border-l-primary border-t-border border-r-border border-b-border' : 'bg-card border-border'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-border !w-3 !h-3 !border-2 !border-background" />
      <Handle type="source" position={Position.Bottom} className="!bg-border !w-3 !h-3 !border-2 !border-background" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{data.nodeType || 'do'}</span>
        <NodeMenu nodeId={data.nodeId} label={data.label} onEdit={data.onEdit} onDelete={data.onDelete} />
      </div>
      <div className="flex items-center gap-2">
        {data.icon}
        <span className="font-medium text-foreground text-sm">{data.label}</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const WorkflowBuilder = () => {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeSelector, setShowNodeSelector] = useState(true);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configNodeType, setConfigNodeType] = useState<ConfigNodeType>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
      animated: false,
    }, eds)),
    [setEdges]
  );

  const getNodeIcon = (label: string) => {
    switch (label) {
      case 'Manual Trigger':
        return <Zap className="w-4 h-4 text-primary" />;
      case 'Webhook':
        return <Webhook className="w-4 h-4 text-primary" />;
      case 'Form':
        return <FileText className="w-4 h-4 text-foreground" />;
      case 'Email Service':
        return <Mail className="w-4 h-4 text-foreground" />;
      case 'Telegram Bot':
        return <MessageCircle className="w-4 h-4 text-foreground" />;
      case 'AI Agent':
        return <Bot className="w-4 h-4 text-foreground" />;
      default:
        return <CheckCircle className="w-4 h-4 text-primary fill-primary" />;
    }
  };

  const getConfigType = (label: string): ConfigNodeType => {
    switch (label) {
      case 'Form': return 'form';
      case 'Email Service': return 'email';
      case 'Telegram Bot': return 'telegram';
      case 'AI Agent': return 'ai-agent';
      default: return null;
    }
  };

  const handleEditNode = useCallback((nodeId: string, label: string) => {
    const configType = getConfigType(label);
    if (configType) {
      setSelectedNodeId(nodeId);
      setConfigNodeType(configType);
      setConfigDialogOpen(true);
    }
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    toast({
      title: "Node deleted",
      description: "The node has been removed from your workflow.",
    });
  }, [setNodes, setEdges, toast]);

  const addNode = (type: 'trigger' | 'action', label: string, nodeType?: string) => {
    // Create the node only - no config dialog on first click
    createNode(type, label, nodeType);
  };

  const createNode = (type: 'trigger' | 'action', label: string, nodeType?: string): string => {
    const xPos = 300;
    const yPos = 100 + (nodes.length * 120);
    const nodeId = `${type}-${Date.now()}`;
    
    const newNode: Node = {
      id: nodeId,
      type: type === 'trigger' ? 'trigger' : 'action',
      position: { x: xPos, y: yPos },
      data: { 
        label,
        icon: getNodeIcon(label),
        nodeType: nodeType || 'do',
        config: {},
        nodeId,
        onEdit: handleEditNode,
        onDelete: handleDeleteNode,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeSelector(false);
    return nodeId;
  };

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Only open config dialog when clicking on the node (not the menu)
    const configType = getConfigType(node.data.label);
    if (configType) {
      setSelectedNodeId(node.id);
      setConfigNodeType(configType);
      setConfigDialogOpen(true);
    }
  }, []);

  const handleConfigSave = (config: Record<string, unknown>) => {
    if (selectedNodeId) {
      setNodes((nds) => nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: { ...node.data, config },
          };
        }
        return node;
      }));
      setSelectedNodeId(null);
    }
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

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card flex-shrink-0">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="text-lg font-semibold text-foreground bg-transparent border-none outline-none"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} className="border-destructive">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleExecute}>
            <Play className="h-4 w-4 mr-2" />
            Execute
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
            animated: false,
          }}
        >
          <Background 
            variant={BackgroundVariant.Lines} 
            gap={24} 
            size={1} 
            color="hsl(var(--border))"
            className="!bg-background"
          />
          <Controls className="!bg-card !border-border !rounded-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-selected" />
          <Panel position="top-right">
            <Button
              onClick={() => setShowNodeSelector(!showNodeSelector)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Panel>
        </ReactFlow>

        {/* Node Selector Panel */}
        {showNodeSelector && (
          <Card className="absolute left-8 top-8 p-6 w-96 bg-card border-border shadow-lg z-10 max-h-[calc(100%-4rem)] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2">What happens next?</h2>
            <p className="text-sm text-muted-foreground mb-6">Choose a trigger to start or a node to continue your workflow</p>

            <div className="space-y-6">
              {/* Triggers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Trigger</h3>
                  <span className="text-xs text-primary font-medium">2 available</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => addNode('trigger', 'Manual Trigger')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Manual Trigger</div>
                        <div className="text-xs text-muted-foreground">Manually start workflow</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => addNode('trigger', 'Webhook')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Webhook className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Webhook</div>
                        <div className="text-xs text-muted-foreground">Trigger via HTTP request</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Nodes Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Node</h3>
                  <span className="text-xs text-primary font-medium">4 available</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => addNode('action', 'Form', 'do')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Form</div>
                        <div className="text-xs text-muted-foreground">Collect user input</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => addNode('action', 'Email Service', 'do')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors">
                        <Mail className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Email Service</div>
                        <div className="text-xs text-muted-foreground">Send emails via Resend</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => addNode('action', 'Telegram Bot', 'do')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors">
                        <MessageCircle className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">Telegram Bot</div>
                        <div className="text-xs text-muted-foreground">Send Telegram messages</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => addNode('action', 'AI Agent', 'do')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors">
                        <Bot className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">AI Agent</div>
                        <div className="text-xs text-muted-foreground">Process with AI models</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <NodeConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        nodeType={configNodeType}
        onSave={handleConfigSave}
      />
    </div>
  );
};

export default WorkflowBuilder;
