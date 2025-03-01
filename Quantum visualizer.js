function QuantumVisualizer({ models = [] }) {
  try {
    const canvasRef = React.useRef(null);
    const [particles, setParticles] = React.useState([]);
    const [animationActive, setAnimationActive] = React.useState(true);
    const [selectedView, setSelectedView] = React.useState('quantum');
    
    React.useEffect(() => {
      // Initialize particles
      if (models.length > 0) {
        const newParticles = [];
        
        models.forEach(model => {
          // Create particles based on model metrics
          const count = Math.floor(model.accuracy / 10); // More accurate models get more particles
          
          for (let i = 0; i < count; i++) {
            newParticles.push({
              id: `${model.id}-particle-${i}`,
              modelId: model.id,
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: Math.random() * 4 + 2,
              speed: Math.random() * 0.3 + 0.1,
              angle: Math.random() * Math.PI * 2,
              color: getParticleColor(model.status),
              pulse: Math.random() > 0.7 // Some particles pulse
            });
          }
        });
        
        setParticles(newParticles);
      }
    }, [models]);
    
    React.useEffect(() => {
      // Animation loop
      let animationId;
      const canvas = canvasRef.current;
      
      if (canvas && animationActive && selectedView === 'quantum') {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        const animate = () => {
          ctx.clearRect(0, 0, width, height);
          
          // Draw connections between particles
          ctx.beginPath();
          for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = (p1.x / 100 * width) - (p2.x / 100 * width);
              const dy = (p1.y / 100 * height) - (p2.y / 100 * height);
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Only connect if they're close enough
              if (distance < 80) {
                ctx.moveTo(p1.x / 100 * width, p1.y / 100 * height);
                ctx.lineTo(p2.x / 100 * width, p2.y / 100 * height);
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 80)})`;
                ctx.stroke();
              }
            }
          }
          
          // Draw and update particles
          const updatedParticles = particles.map(p => {
            // Update position
            const newX = p.x + Math.cos(p.angle) * p.speed;
            const newY = p.y + Math.sin(p.angle) * p.speed;
            
            // Bounce off edges
            let newAngle = p.angle;
            if (newX <= 0 || newX >= 100) {
              newAngle = Math.PI - newAngle;
            }
            if (newY <= 0 || newY >= 100) {
              newAngle = -newAngle;
            }
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(
              p.x / 100 * width, 
              p.y / 100 * height, 
              p.size, 
              0, 
              Math.PI * 2
            );
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Return updated particle
            return {
              ...p,
              x: Math.max(0, Math.min(100, newX)),
              y: Math.max(0, Math.min(100, newY)),
              angle: newAngle
            };
          });
          
          setParticles(updatedParticles);
          animationId = requestAnimationFrame(animate);
        };
        
        animate();
      }
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }, [particles, animationActive, selectedView]);
    
    const getParticleColor = (status) => {
      switch (status) {
        case 'healthy':
          return 'rgba(16, 185, 129, 0.7)';
        case 'warning':
          return 'rgba(245, 158, 11, 0.7)';
        case 'critical':
          return 'rgba(239, 68, 68, 0.7)';
        case 'optimizing':
          return 'rgba(99, 102, 241, 0.7)';
        default:
          return 'rgba(99, 102, 241, 0.7)';
      }
    };
    
    const toggleAnimation = () => {
      setAnimationActive(!animationActive);
    };
    
    const handleViewChange = (e) => {
      setSelectedView(e.target.value);
    };
    
    const renderModelDistribution = () => {
      if (models.length === 0) return null;
      
      const industryGroups = {};
      let totalModels = 0;
      
      // Group models by industry
      models.forEach(model => {
        if (!industryGroups[model.industry]) {
          industryGroups[model.industry] = {
            count: 0,
            statuses: { healthy: 0, warning: 0, critical: 0, optimizing: 0 }
          };
        }
        industryGroups[model.industry].count++;
        industryGroups[model.industry].statuses[model.status]++;
        totalModels++;
      });
      
      return (
        <div data-name="distribution-view" className="p-4">
          <h3 data-name="distribution-title" className="text-lg font-medium mb-4">Model Distribution by Industry</h3>
          
          <div data-name="distribution-chart">
            {Object.entries(industryGroups).map(([industry, data]) => (
              <div data-name="industry-bar" key={industry} className="mb-4">
                <div data-name="industry-header" className="flex justify-between mb-1">
                  <span data-name="industry-name" className="text-sm font-medium">
                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                  </span>
                  <span data-name="industry-count" className="text-sm text-slate-500">
                    {data.count} model{data.count !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div data-name="bar-container" className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div data-name="bar-segments" className="h-full flex">
                    {data.statuses.healthy > 0 && (
                      <div 
                        data-name="healthy-segment" 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(data.statuses.healthy / data.count) * 100}%` }}
                        title={`Healthy: ${data.statuses.healthy}`}
                      ></div>
                    )}
                    {data.statuses.warning > 0 && (
                      <div 
                        data-name="warning-segment" 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(data.statuses.warning / data.count) * 100}%` }}
                        title={`Warning: ${data.statuses.warning}`}
                      ></div>
                    )}
                    {data.statuses.critical > 0 && (
                      <div 
                        data-name="critical-segment" 
                        className="bg-red-500 h-full" 
                        style={{ width: `${(data.statuses.critical / data.count) * 100}%` }}
                        title={`Critical: ${data.statuses.critical}`}
                      ></div>
                    )}
                    {data.statuses.optimizing > 0 && (
                      <div 
                        data-name="optimizing-segment" 
                        className="bg-indigo-500 h-full" 
                        style={{ width: `${(data.statuses.optimizing / data.count) * 100}%` }}
                        title={`Optimizing: ${data.statuses.optimizing}`}
                      ></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div data-name="legend" className="mt-4 flex flex-wrap gap-4">
            <div data-name="legend-item" className="flex items-center">
              <div data-name="legend-color" className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span data-name="legend-label" className="text-sm">Healthy</span>
            </div>
            <div data-name="legend-item" className="flex items-center">
              <div data-name="legend-color" className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span data-name="legend-label" className="text-sm">Warning</span>
            </div>
            <div data-name="legend-item" className="flex items-center">
              <div data-name="legend-color" className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span data-name="legend-label" className="text-sm">Critical</span>
            </div>
            <div data-name="legend-item" className="flex items-center">
              <div data-name="legend-color" className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span data-name="legend-label" className="text-sm">Optimizing</span>
            </div>
          </div>
        </div>
      );
    };
    
    if (models.length === 0) {
      return (
        <div data-name="no-models" className="text-center p-6">
          <p data-name="no-models-message" className="text-slate-500 dark:text-slate-400">
            No models available for visualization.
          </p>
        </div>
      );
    }
    
    return (
      <div data-name="quantum-visualizer">
        <div data-name="visualizer-controls" className="flex justify-between mb-4">
          <div data-name="view-selector" className="flex items-center">
            <label data-name="view-label" htmlFor="view-select" className="mr-2 text-sm font-medium">
              View:
            </label>
            <select
              id="view-select"
              data-name="view-dropdown"
              className="p-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
              value={selectedView}
              onChange={handleViewChange}
            >
              <option value="quantum">Quantum Particles</option>
              <option value="distribution">Model Distribution</option>
            </select>
          </div>
          
          {selectedView === 'quantum' && (
            <button
              data-name="toggle-animation"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
              onClick={toggleAnimation}
            >
              {animationActive ? 'Pause Animation' : 'Start Animation'}
            </button>
          )}
        </div>
        
        {selectedView === 'quantum' ? (
          <div data-name="quantum-canvas-container" className="relative h-64 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <canvas
              data-name="quantum-canvas"
              ref={canvasRef}
              width={800}
              height={300}
              className="w-full h-full"
            />
            
            <div data-name="quantum-info" className="absolute bottom-2 left-2 bg-white dark:bg-slate-800 bg-opacity-80 dark:bg-opacity-80 p-2 rounded text-xs">
              <p data-name="particles-info">
                Particles: {particles.length} | 
                Each particle represents model accuracy and status
              </p>
            </div>
          </div>
        ) : (
          renderModelDistribution()
        )}
      </div>
    );
  } catch (error) {
    console.error('QuantumVisualizer render error:', error);
    reportError(error);
    return <div data-name="visualizer-error" className="text-red-600 p-4">Error loading quantum visualizer.</div>;
  }
}
