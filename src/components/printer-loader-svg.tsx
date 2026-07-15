"use client";

export function PrinterLoaderSvg() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 400 200" 
      width="100%" 
      height="100%" 
      style={{ background: "transparent" }}
    >
      <defs>
        {/* Neon Glow Filter */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Printing Line Animation */
        .print-line {
          stroke: #ffffff;
          stroke-width: 3;
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          filter: url(#neon-glow);
        }

        /* Extruder Nozzle Movement Animation */
        .extruder-nozzle {
          animation: moveNozzle 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Light Rays Pulsing Animation */
        .rays {
          fill: #ffffff;
          animation: pulseRays 0.5s ease-in-out infinite alternate;
        }

        @keyframes drawLine {
          0% { stroke-dashoffset: 200; opacity: 1; }
          70% { stroke-dashoffset: 0; opacity: 1; }
          85% { stroke-dashoffset: 0; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        @keyframes moveNozzle {
          0% { transform: translateX(0); opacity: 1; }
          70% { transform: translateX(200px); opacity: 1; }
          80% { transform: translateX(200px); opacity: 0; }
          90% { transform: translateX(0); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes pulseRays {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}} />

      {/* The Bed / Surface Line being printed */}
      <line x1="100" y1="135" x2="300" y2="135" className="print-line" />

      {/* The Extruder Assembly (Nozzle + Rays) */}
      <g className="extruder-nozzle">
        {/* Stylized Extruder Body based on your logo */}
        <g fill="#ffffff" transform="translate(77, 45)">
          <rect x={15} y={20} width={16} height={8} rx={1} />
          <rect x={10} y={31} width={26} height={4} />
          <rect x={10} y={38} width={26} height={4} />
          <rect x={10} y={45} width={26} height={4} />
          <rect x={10} y={52} width={26} height={4} />
          {/* Nozzle Tip */}
          <polygon points="13,59 33,59 23,73" />
        </g>
        
        {/* Extruder Light Rays */}
        <g className="rays" transform="translate(77, 45)">
          <polygon points="15,79 12,83 14,84 17,80" />
          <polygon points="19,82 17,87 19,88 21,83" />
          <polygon points="23,83 23,89 25,89 25,83" />
          <polygon points="27,83 29,88 31,87 29,82" />
          <polygon points="31,80 34,84 36,83 33,79" />
        </g>
      </g>
    </svg>
  );
}
