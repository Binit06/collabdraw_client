export interface MyBoard {
    brushColor: string;
    brushSize: number;
    eraserMode: boolean;
    connect?: boolean;
}
export interface WebSocketMessage {
    type: string;
    data: any;
}

export interface UsersProps {
    username: string;
}