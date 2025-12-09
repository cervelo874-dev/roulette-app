import React, { useEffect, useRef } from 'react';
import type { Sector } from '../types';

interface RouletteCanvasProps {
    sectors: Sector[];
    spinning: boolean;
    onFinished: (winner: Sector | null) => void;
}

const RouletteCanvas: React.FC<RouletteCanvasProps> = ({ sectors, spinning, onFinished }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Cache for loaded images
    const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

    // Force re-render trigger
    const [, setTick] = React.useState(0);

    // Animation state in refs
    const rotationRef = useRef(0);
    const velocityRef = useRef(0);
    const isSpinningRef = useRef(false);

    // Pre-load images
    useEffect(() => {
        let mounted = true;
        sectors.forEach(sector => {
            if (sector.type === 'image' && sector.value && !imageCacheRef.current.has(sector.value)) {
                const img = new Image();
                img.src = sector.value;
                img.onload = () => {
                    if (mounted) setTick(t => t + 1);
                };
                imageCacheRef.current.set(sector.value, img);
            }
        });
        return () => { mounted = false; };
    }, [sectors]);

    useEffect(() => {
        if (spinning && !isSpinningRef.current) {
            startSpin();
        }
    }, [spinning]);

    const startSpin = () => {
        isSpinningRef.current = true;
        velocityRef.current = 0.3 + Math.random() * 0.2;
    };

    const determineWinner = () => {
        const totalSectors = sectors.length;
        if (totalSectors === 0) return;

        const currentRotation = rotationRef.current % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / totalSectors;

        // Angle at the top pointer (1.5 PI)
        let pointerAngle = (1.5 * Math.PI - currentRotation) % (2 * Math.PI);
        if (pointerAngle < 0) pointerAngle += 2 * Math.PI;

        const winningIndex = Math.floor(pointerAngle / sliceAngle);
        const safeIndex = Math.min(Math.max(winningIndex, 0), totalSectors - 1);

        onFinished(sectors[safeIndex]);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            const size = 500;
            canvas.width = size;
            canvas.height = size;
            const centerX = size / 2;
            const centerY = size / 2;
            const radius = size / 2 - 20;

            ctx.clearRect(0, 0, size, size);

            if (sectors.length === 0) return;

            const sliceAngle = (2 * Math.PI) / sectors.length;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotationRef.current);

            // Determine which sector is currently winning (for highlight)
            const currentRotation = rotationRef.current % (2 * Math.PI);
            let pointerAngleOnWheel = (1.5 * Math.PI - currentRotation) % (2 * Math.PI);
            if (pointerAngleOnWheel < 0) pointerAngleOnWheel += 2 * Math.PI;
            const winningIndex = Math.floor(pointerAngleOnWheel / sliceAngle);

            const drawSector = (i: number, isWinner: boolean) => {
                const sector = sectors[i];
                const startAngle = i * sliceAngle;
                const endAngle = startAngle + sliceAngle;

                ctx.save();

                // 1. Draw Sector Background
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.closePath(); // Critical: Close path

                ctx.fillStyle = sector.color;
                ctx.fill();

                // Highlight Border
                if (isWinner) {
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = '#ffd700'; // Gold
                    ctx.shadowColor = '#ffff00';
                    ctx.shadowBlur = 15;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                }

                // 2. Draw Content
                ctx.save();

                if (sector.type === 'image') {
                    const img = imageCacheRef.current.get(sector.value);

                    // Clip to wedge
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, radius, startAngle, endAngle);
                    ctx.closePath();
                    ctx.clip();

                    if (img && img.complete && img.naturalWidth > 0) {
                        const midAngle = startAngle + sliceAngle / 2;
                        const dist = radius * 0.55;
                        const cx = Math.cos(midAngle) * dist;
                        const cy = Math.sin(midAngle) * dist;

                        ctx.translate(cx, cy);
                        ctx.rotate(midAngle + Math.PI / 2);

                        const userRotRad = (sector.imageRotation ?? 0) * (Math.PI / 180);
                        ctx.rotate(userRotRad);

                        ctx.translate(sector.imageX ?? 0, sector.imageY ?? 0);

                        const scale = sector.imageScale ?? 1.0;
                        const coverSize = (radius * 0.8) * scale;

                        ctx.drawImage(img, -coverSize / 2, -coverSize / 2, coverSize, coverSize);
                    } else {
                        ctx.rotate(startAngle + sliceAngle / 2);
                        ctx.textAlign = 'right';
                        ctx.fillStyle = 'rgba(255,255,255,0.8)';
                        ctx.font = 'bold 20px Arial';
                        ctx.fillText("...", radius - 30, 8);
                    }
                } else {
                    // Text Mode
                    ctx.rotate(startAngle + sliceAngle / 2);
                    ctx.textAlign = 'right';
                    if (isWinner) {
                        ctx.fillStyle = '#fff';
                        ctx.font = 'bold 26px Arial';
                        ctx.shadowColor = "rgba(0,0,0,0.8)";
                        ctx.shadowBlur = 8;
                    } else {
                        ctx.fillStyle = '#fff';
                        ctx.font = 'bold 24px Arial';
                        ctx.shadowColor = "rgba(0,0,0,0.5)";
                        ctx.shadowBlur = 4;
                    }
                    ctx.fillText(sector.value, radius - 30, 8);
                }

                ctx.restore(); // Restore content transform

                // Overlay for Winner
                if (isWinner) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, radius, startAngle, endAngle);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                    ctx.fill();
                    ctx.restore();
                }

                ctx.restore(); // Restore sector context
            };

            // Pass 1: Draw non-winners or ALL if spinning
            const isStopped = !isSpinningRef.current && velocityRef.current === 0;

            sectors.forEach((_, i) => {
                // If we are stopped, skip the winner in this pass
                if (isStopped && i === winningIndex) return;
                // Otherwise draw everyone
                drawSector(i, false);
            });

            // Pass 2: Draw winner LAST (if stopped)
            if (isStopped && winningIndex !== -1 && sectors[winningIndex]) {
                drawSector(winningIndex, true);
            }

            ctx.restore();

            // Finish Line / Pointer
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius + 10);
            ctx.lineTo(centerX - 20, centerY - radius - 20);
            ctx.lineTo(centerX + 20, centerY - radius - 20);
            ctx.fillStyle = '#333';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Center Pin
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.beginPath();
            // Small dot in center
            ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#333';
            ctx.fill();
        };

        const loop = () => {
            if (isSpinningRef.current) {
                velocityRef.current *= 0.99;
                if (velocityRef.current < 0.001) {
                    isSpinningRef.current = false;
                    velocityRef.current = 0;
                    determineWinner();
                }
                rotationRef.current += velocityRef.current;
            }

            render();
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [sectors]);

    return (
        <div className="flex justify-center items-center p-4">
            <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-xl" />
        </div>
    );
};

export default RouletteCanvas;
