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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Save, Play, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showNodeSelector, setShowNodeSelector] = useState(true);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: 'trigger' | 'node', label: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label },
      style: {
        background: type === 'trigger' ? 'hsl(var(--primary))' : 'hsl(var(--feta))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '10px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeSelector(false);
  };

  const handleSave = () => {
    // TODO: Save workflow to database
    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    });
  };

  const handleExecute = () => {
    // TODO: Execute workflow nodes one by one
    toast({
      title: "Workflow executing",
      description: "Your workflow is now running.",
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="text-lg font-semibold text-foreground bg-transparent border-none outline-none"
        />
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

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <Panel position="top-right">
            <Button
              onClick={() => setShowNodeSelector(!showNodeSelector)}
              className="bg-primary hover:bg-primary/90"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Panel>
        </ReactFlow>

        {showNodeSelector && (
          <Card className="absolute left-8 top-8 p-6 w-96 bg-card border-border shadow-lg z-10">
            <h2 className="text-xl font-semibold text-foreground mb-2">What happens next?</h2>
            <p className="text-sm text-muted-foreground mb-6">Choose a trigger to start or a node to continue your workflow</p>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Trigger</h3>
                  <span className="text-xs text-muted-foreground">2 available</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => addNode('trigger', 'Manual Trigger')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm text-foreground">Manual Trigger</div>
                    <div className="text-xs text-muted-foreground mt-1">Manually start workflow</div>
                  </button>
                  <button
                    onClick={() => addNode('trigger', 'Webhook')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm text-foreground">Webhook</div>
                    <div className="text-xs text-muted-foreground mt-1">Trigger via HTTP request</div>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Node</h3>
                  <span className="text-xs text-muted-foreground">4 available</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => addNode('node', 'Form')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm text-foreground">Form</div>
                    <div className="text-xs text-muted-foreground mt-1">Collect form data</div>
                  </button>
                  <button
                    onClick={() => addNode('node', 'Email Service')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm text-foreground">Email Service</div>
                    <div className="text-xs text-muted-foreground mt-1">Send emails</div>
                  </button>
                  <button
                    onClick={() => addNode('node', 'Telegram Bot')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm text-foreground">Telegram Bot</div>
                    <div className="text-xs text-muted-foreground mt-1">Send Telegram messages</div>
                  </button>
                  <button
                    onClick={() => addNode('node', 'AI Agent')}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm text-foreground">AI Agent</div>
                    <div className="text-xs text-muted-foreground mt-1">Add AI capabilities</div>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
