import { Position } from "../math";

let mousePos : Position = {x: 0, y: 0};
export function bindMouse()
{
  window.addEventListener('mousemove', (e: MouseEvent) => {
    mousePos = { x: e.clientX, y: e.clientY };
  });
}

export function useMouse(){ return mousePos; }
