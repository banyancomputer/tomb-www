import { useEffect, useRef } from 'react';
// TODO: Figure out how to properly import memory
// @ts-ignore
import { memory } from 'woo-woo-wasm/woo_woo_wasm_bg.wasm';
import { Universe } from 'woo-woo-wasm';

const CELL_SIZE = 5; // px
const GRID_COLOR = '#CCCCCC';
const DEAD_COLOR = '#FFFFFF';
const ALIVE_COLOR = '#000000';

const LoadingGame: React.FC<{}> = () => {
    // Create a universe state
    // const [ universe, setUniverse ] = useState<Universe>(new Universe());
	
    const universeRef = useRef<Universe>(new Universe())
    const width = universeRef.current.width();
	const height = universeRef.current.height();
    const size = { width: (CELL_SIZE + 1) * width + 1, height: (CELL_SIZE + 1) * height + 1 }
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const requestIdRef = useRef<number | null>(null);
	
	const getIndex = (row: any, column: any) => {
		return row * width + column;
	};

	const bitIsSet = (n: any, arr: any) => {
		const byte = Math.floor(n / 8);
		const mask = 1 << n % 8;
		return (arr[byte] & mask) === mask;
	};

    // Load the dom from an effect
    const renderFrame = () => {
		const ctx = canvasRef.current?.getContext('2d');
		if (!ctx) {
			return;
		}
		// Draw the grid
		ctx.beginPath();
		ctx.strokeStyle = GRID_COLOR;

		// Vertical lines.
		for (let i = 0; i <= width; i++) {
			ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
			ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
		}

		// Horizontal lines.
		for (let j = 0; j <= height; j++) {
			ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
			ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
		}
		ctx.stroke();

		// Draw the cells
		const cellsPtr = universeRef.current.cells();
		const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8);
		ctx.beginPath();

		for (let row = 0; row < height; row++) {
			for (let col = 0; col < width; col++) {
				const idx = getIndex(row, col);

				ctx.fillStyle = !bitIsSet(idx, cells) ? DEAD_COLOR : ALIVE_COLOR;

				ctx.fillRect(
					col * (CELL_SIZE + 1) + 1,
					row * (CELL_SIZE + 1) + 1,
					CELL_SIZE,
					CELL_SIZE
				);
			}
		}
		ctx.stroke();
    }
    
    const tick = () => {
        if (!canvasRef.current) {
			return;
		}
		universeRef.current.tick();
		renderFrame();
		requestIdRef.current = requestAnimationFrame(tick);
    };

	useEffect(() => {
		requestIdRef.current = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(requestIdRef.current!);
		};
	}, []);

	return (
		<div className="overflow-auto">
			<canvas {...size} ref={canvasRef}></canvas>
		</div>
	);
};

export default LoadingGame;
