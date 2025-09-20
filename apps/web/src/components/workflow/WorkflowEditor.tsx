import React, { useCallback, useState } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TriggerPanel from './TriggerPanel.js';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Define initial nodes
const initialNodes: Node[] = [];

// Define initial edges
const initialEdges: Edge[] = [];

interface WorkflowEditorProps {
  workflowId?: string;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ workflowId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showTriggerPanel, setShowTriggerPanel] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSelectTrigger = useCallback((triggerId: string) => {
    const newNode: Node = {
      id: `trigger-${triggerId}`,
      type: 'input',
      position: { x: 250, y: 100 },
      data: { label: triggerId.charAt(0).toUpperCase() + triggerId.slice(1) + ' Trigger', kind: 'trigger', trigger: triggerId },
    };
    setNodes([newNode]);
    setShowTriggerPanel(false);
  }, [setNodes]);

  const addNode = useCallback(() => {
    const kinds = [
      { kind: 'email', label: 'Email' },
      { kind: 'telegram', label: 'Telegram' },
      { kind: 'whatsapp', label: 'WhatsApp' },
    ] as const;
    const next = kinds[(nodes.length - 0) % kinds.length];
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      type: 'default',
      position: { x: 100 + nodes.length * 150, y: 100 },
      data: { label: `${next.label} Node`, kind: next.kind, config: {} },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const updateSelectedNodeData = (patch: Record<string, unknown>) => {
    if (!selectedNode) return;
    setNodes((nds) => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, config: { ...(n.data as any).config, ...patch } } } : n));
  };

  return (
    <div className="w-full h-full relative flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
          className="bg-background"
        >
          <Controls className="bg-card border border-border" />
          <MiniMap 
            className="bg-card border border-border"
            nodeColor="#2B66FE"
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1}
            color="hsl(var(--border))"
          />
        </ReactFlow>

        {nodes.length === 0 && !showTriggerPanel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <button
                onClick={() => setShowTriggerPanel(true)}
                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-surface-hover transition-all cursor-pointer group"
              >
                <Plus className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="mt-2 text-sm text-muted-foreground group-hover:text-foreground">Add first step...</span>
              </button>
            </div>
          </div>
        )}

        {nodes.length > 0 && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button onClick={addNode} size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Node
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="shadow-lg"
              onClick={() => {
                // Simple run simulation: log node configs
                // eslint-disable-next-line no-console
                console.log('Simulate run with nodes:', nodes.map(n => ({ id: n.id, kind: (n.data as any)?.kind, config: (n.data as any)?.config })));
                alert('Test run simulated. Check console for payload.');
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Test Run
            </Button>
          </div>
        )}
      </div>
      
      {showTriggerPanel && (
        <TriggerPanel onSelectTrigger={handleSelectTrigger} />
      )}

      {/* Inspector */}
      {selectedNode && (
        <div className="w-96 h-full bg-surface border-l border-border p-4 space-y-4 overflow-auto">
          <h3 className="text-lg font-semibold">Edit Node</h3>
          <Card className="p-4 space-y-3">
            <div>
              <Label>Type</Label>
              <div className="text-sm text-muted-foreground mt-1">{(selectedNode.data as any)?.kind ?? 'node'}</div>
            </div>
            {((selectedNode.data as any)?.kind === 'email') && (
              <>
                <div>
                  <Label>From</Label>
                  <Input onChange={(e) => updateSelectedNodeData({ from: e.target.value })} />
                </div>
                <div>
                  <Label>To</Label>
                  <Input onChange={(e) => updateSelectedNodeData({ to: e.target.value })} />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input onChange={(e) => updateSelectedNodeData({ subject: e.target.value })} />
                </div>
                <div>
                  <Label>Body</Label>
                  <Textarea rows={4} onChange={(e) => updateSelectedNodeData({ body: e.target.value })} />
                </div>
              </>
            )}
            {((selectedNode.data as any)?.kind === 'telegram') && (
              <>
                <div>
                  <Label>Chat ID</Label>
                  <Input onChange={(e) => updateSelectedNodeData({ chatId: e.target.value })} />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea rows={3} onChange={(e) => updateSelectedNodeData({ message: e.target.value })} />
                </div>
              </>
            )}
            {((selectedNode.data as any)?.kind === 'whatsapp') && (
              <>
                <div>
                  <Label>Phone Number</Label>
                  <Input onChange={(e) => updateSelectedNodeData({ phone: e.target.value })} />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea rows={3} onChange={(e) => updateSelectedNodeData({ message: e.target.value })} />
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowEditor;