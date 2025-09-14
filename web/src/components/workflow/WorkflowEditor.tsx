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
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TriggerPanel from './TriggerPanel';

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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSelectTrigger = useCallback((triggerId: string) => {
    const newNode: Node = {
      id: `trigger-${triggerId}`,
      type: 'input',
      position: { x: 250, y: 100 },
      data: { label: triggerId.charAt(0).toUpperCase() + triggerId.slice(1) + ' Trigger' },
    };
    setNodes([newNode]);
    setShowTriggerPanel(false);
  }, [setNodes]);

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      type: 'default',
      position: { 
        x: 100 + nodes.length * 150, 
        y: 100 
      },
      data: { 
        label: `Node ${nodes.length + 1}` 
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  return (
    <div className="w-full h-full relative flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
          <div className="absolute bottom-4 right-4">
            <Button onClick={addNode} size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Node
            </Button>
          </div>
        )}
      </div>
      
      {showTriggerPanel && (
        <TriggerPanel onSelectTrigger={handleSelectTrigger} />
      )}
    </div>
  );
};

export default WorkflowEditor;