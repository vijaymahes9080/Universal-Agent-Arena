import React, { useRef, useEffect } from 'react';

export interface SpatialAgentNode {
  uaid: string;
  name: string;
  tier: number;
  district: string;
  reputation: number;
  status: string;
  speed: number;
  reasoning: number;
}

interface CyberCanvasProps {
  agents: SpatialAgentNode[];
}

export const CyberCanvas: React.FC<CyberCanvasProps> = ({ agents }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Setup Canvas dimensions
    const width = canvas.parentElement?.clientWidth || 800;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Define spatial district hubs
    const districts = [
      { name: "University", x: width * 0.2, y: height * 0.3, color: "#3b82f6" },
      { name: "Stock Exchange", x: width * 0.8, y: height * 0.3, color: "#10b981" },
      { name: "Combat Arena", x: width * 0.5, y: height * 0.5, color: "#ef4444" },
      { name: "Parliament", x: width * 0.25, y: height * 0.75, color: "#8b5cf6" },
      { name: "Tech Incubator", x: width * 0.75, y: height * 0.75, color: "#f59e0b" }
    ];

    // Node objects with physics positions
    const nodes = agents.map((agent, i) => {
      const d = districts.find(dist => dist.name === agent.district) || districts[i % districts.length];
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 45;
      return {
        ...agent,
        x: d.x + Math.cos(angle) * radius,
        y: d.y + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * (agent.speed / 40),
        vy: (Math.random() - 0.5) * (agent.speed / 40),
        targetX: d.x,
        targetY: d.y,
        color: d.color,
        pulse: Math.random() * Math.PI * 2
      };
    });

    let tick = 0;

    const render = () => {
      tick += 0.04;
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // Grid pattern
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw District Hub Zones
      districts.forEach(d => {
        // Outer aura
        const gradient = ctx.createRadialGradient(d.x, d.y, 10, d.x, d.y, 80);
        gradient.addColorStop(0, `${d.color}25`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 80, 0, Math.PI * 2);
        ctx.fill();

        // Hub boundary ring
        ctx.strokeStyle = `${d.color}60`;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hub title
        ctx.fillStyle = d.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.name.toUpperCase(), d.x, d.y - 72);
      });

      // Connecting lasers between active nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 * (1 - dist / 110)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Render Agent Nodes
      nodes.forEach(node => {
        node.pulse += 0.05;
        // Float toward hub center gently
        node.x += (node.targetX - node.x) * 0.01 + node.vx;
        node.y += (node.targetY - node.y) * 0.01 + node.vy;

        // Keep inside canvas bounds
        node.x = Math.max(25, Math.min(width - 25, node.x));
        node.y = Math.max(25, Math.min(height - 25, node.y));

        // Node Glow Ring
        const rGlow = 14 + Math.sin(node.pulse) * 3;
        ctx.fillStyle = `${node.color}35`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, rGlow, 0, Math.PI * 2);
        ctx.fill();

        // Node Solid Core
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + 22);

        // Status bubble tag
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(node.x - 30, node.y - 24, 60, 14);
        ctx.strokeStyle = `${node.color}80`;
        ctx.strokeRect(node.x - 30, node.y - 24, 60, 14);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px sans-serif';
        ctx.fillText(`Tier ${node.tier} • ${node.uaid.substring(0, 7)}`, node.x, node.y - 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [agents]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-[0_0_30px_rgba(15,23,42,0.8)]">
      <canvas ref={canvasRef} className="w-full block bg-[#060913]" />
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono text-neonCyan flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-neonGreen animate-ping"></span>
        <span>SPATIAL MATRIX: 2D REAL-TIME AGENT NETWORK</span>
      </div>
    </div>
  );
};
