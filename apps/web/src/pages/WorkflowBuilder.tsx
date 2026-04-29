import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { NodeConfigDialog } from "@/components/NodeConfigDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ConfigNodeType = "form" | "email" | "telegram" | "ai-agent" | null;

interface NodeMenuProps {
  nodeId: string;
  label: string;
  onEdit: (nodeId: string, label: string) => void;
  onDelete: (nodeId: string) => void;
}

const NodeMenu = ({ nodeId, label, onEdit, onDelete }: NodeMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="p-1 hover:bg-muted rounded" onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-32">
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(nodeId, label); }} className="gap-2">
        <Edit className="h-4 w-4" /> Edit
      </DropdownMenuItem>
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(nodeId); }} className="gap-2 text-destructive focus:text-destructive">
        <Trash2 className="h-4 w-4" /> Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const TriggerNode = ({ data, selected }: NodeProps) => (
  <div className={`px-4 py-3 rounded-lg border shadow-sm min-w-[180px] transition-colors relative ${selected ? 'bg-selected border-l-[3px] border-l-primary border-t-border border-r-border border-b-border' : 'bg-card border-border'}`}>
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

const ActionNode = ({ data, selected }: NodeProps) => (
  <div className={`px-4 py-3 rounded-lg border shadow-sm min-w-[180px] transition-colors relative ${selected ? 'bg-selected border-l-[3px] border-l-primary border-t-border border-r-border border-b-border' : 'bg-card border-border'}`}>
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

const nodeTypes = { trigger: TriggerNode, action: ActionNode };

const WorkflowBuilder = () => {
  const { id: workflowId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodeSelector, setShowNodeSelector] = useState(true);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowEnabled, setWorkflowEnabled] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configNodeType, setConfigNodeType] = useState<ConfigNodeType>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!workflowId) return;
    api.getWorkflowById(workflowId)
      .then((res: any) => {
        const wf = res.workflow;
        if (!wf) return;
        setWorkflowName(wf.name ?? "Untitled Workflow");
        setWorkflowEnabled(wf.enabled ?? false);
        const savedNodes: Node[] = (wf.flow?.nodes ?? wf.nodes ?? []).map((n: any) => ({
          ...n,
          data: {
            ...n.data,
            icon: getNodeIcon(n.data?.label ?? ""),
            onEdit: handleEditNode,
            onDelete: handleDeleteNode,
          },
        }));
        const savedEdges: Edge[] = wf.flow?.edges ?? wf.edges ?? [];
        setNodes(savedNodes);
        setEdges(savedEdges);
        if (savedNodes.length > 0) setShowNodeSelector(false);
      })
      .catch(() => {
        // New workflow — start blank
      });
  }, [workflowId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params, type: 'smoothstep',
      style: { stroke: 'hsl(var(--border))', strokeWidth: 2 }, animated: false,
    }, eds)),
    [setEdges]
  );

  const getNodeIcon = (label: string) => {
    switch (label) {
      case 'Manual Trigger': return <Zap className="w-4 h-4 text-primary" />;
      case 'Webhook': return <Webhook className="w-4 h-4 text-primary" />;
      case 'Form': return <FileText className="w-4 h-4 text-foreground" />;
      case 'Email Service': return <Mail className="w-4 h-4 text-foreground" />;
      case 'Telegram Bot': return <MessageCircle className="w-4 h-4 text-foreground" />;
      case 'AI Agent': return <Bot className="w-4 h-4 text-foreground" />;
      default: return <CheckCircle className="w-4 h-4 text-primary fill-primary" />;
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
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    toast.success("Node deleted");
  }, [setNodes, setEdges]);

  const addNode = (type: 'trigger' | 'action', label: string, nodeType?: string) => {
    const nodeId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: type === 'trigger' ? 'trigger' : 'action',
      position: { x: 300, y: 100 + nodes.length * 120 },
      data: {
        label, icon: getNodeIcon(label),
        nodeType: nodeType || 'do', config: {}, nodeId,
        onEdit: handleEditNode, onDelete: handleDeleteNode,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeSelector(false);
  };

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const configType = getConfigType(node.data.label);
    if (configType) {
      setSelectedNodeId(node.id);
      setConfigNodeType(configType);
      setConfigDialogOpen(true);
    }
  }, []);

  const handleConfigSave = (config: Record<string, unknown>) => {
    if (selectedNodeId) {
      setNodes((nds) => nds.map((n) =>
        n.id === selectedNodeId ? { ...n, data: { ...n.data, config } } : n
      ));
      setSelectedNodeId(null);
    }
  };

  const serializableNodes = nodes.map(({ data, ...rest }) => ({
    ...rest,
    data: { label: data.label, nodeType: data.nodeType, config: data.config, nodeId: data.nodeId },
  }));

  const handleSave = async () => {
    if (!workflowId) return;
    setSaving(true);
    try {
      await api.updateWorkflow(workflowId, {
        name: workflowName,
        enabled: workflowEnabled,
        nodes: serializableNodes,
        edges,
        flow: { nodes: serializableNodes, edges },
      });
      toast.success("Workflow saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!workflowId) return;
    setExecuting(true);
    try {
      await handleSave();
      const res: any = await api.executeWorkflow(workflowId);
      toast.success(`Execution started — ID: ${res.executionId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to execute workflow");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/personal")} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-lg font-semibold text-foreground bg-transparent border-none outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleExecute} disabled={executing}>
            <Play className="h-4 w-4 mr-2" />
            {executing ? "Running..." : "Execute"}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect} onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes} fitView className="bg-background"
          defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: 'hsl(var(--border))', strokeWidth: 2 }, animated: false }}
        >
          <Background variant={BackgroundVariant.Lines} gap={24} size={1} color="hsl(var(--border))" className="!bg-background" />
          <Controls className="!bg-card !border-border !rounded-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-selected" />
          <Panel position="top-right">
            <Button onClick={() => setShowNodeSelector(!showNodeSelector)} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </Panel>
        </ReactFlow>

        {showNodeSelector && (
          <Card className="absolute left-8 top-8 p-6 w-96 bg-card border-border shadow-lg z-10 max-h-[calc(100%-4rem)] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2">What happens next?</h2>
            <p className="text-sm text-muted-foreground mb-6">Choose a trigger or node to add to your workflow</p>
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Trigger</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Manual Trigger', icon: <Zap className="w-4 h-4 text-primary" />, desc: 'Manually start workflow' },
                    { label: 'Webhook', icon: <Webhook className="w-4 h-4 text-primary" />, desc: 'Trigger via HTTP request' },
                  ].map(({ label, icon, desc }) => (
                    <button key={label} onClick={() => addNode('trigger', label)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">{icon}</div>
                        <div><div className="font-medium text-sm text-foreground">{label}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Node</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Form', icon: <FileText className="w-4 h-4 text-foreground" />, desc: 'Collect user input' },
                    { label: 'Email Service', icon: <Mail className="w-4 h-4 text-foreground" />, desc: 'Send emails via Resend' },
                    { label: 'Telegram Bot', icon: <MessageCircle className="w-4 h-4 text-foreground" />, desc: 'Send Telegram messages' },
                    { label: 'AI Agent', icon: <Bot className="w-4 h-4 text-foreground" />, desc: 'Process with AI models' },
                  ].map(({ label, icon, desc }) => (
                    <button key={label} onClick={() => addNode('action', label, 'do')}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors">{icon}</div>
                        <div><div className="font-medium text-sm text-foreground">{label}</div><div className="text-xs text-muted-foreground">{desc}</div></div>
                      </div>
                    </button>
                  ))}
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
