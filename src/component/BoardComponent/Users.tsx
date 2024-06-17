import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { isUserEvent } from "../checks/checks";
import { UsersProps, WebSocketMessage } from "../types";
import { UncontrolledTooltip } from 'reactstrap';
import Avatar from 'react-avatar';
const Users = () => {
    const { username } = useParams<{ username: string }>();
    if (username) {
        const { lastJsonMessage } = useWebSocket(import.meta.env.VITE_SERVERURL, {
            share: true,
            filter: isUserEvent,
        });
        let usersArray: UsersProps[] = [];
        if (lastJsonMessage && (lastJsonMessage as WebSocketMessage).data) {
            usersArray = Object.values((lastJsonMessage as WebSocketMessage).data.users || {});
        }
        if (usersArray) {
            return usersArray.map(user => (
                <div key={user.username} style={{display: "flex", flexDirection: 'row', gap: '10px'}}>
                    <span id={user.username} className="userInfo" key={user.username}>
                        <Avatar name={user.username} size={'40'} round="20px" />
                    </span>
                    <UncontrolledTooltip placement="top" target={user.username}>
                        {user.username}
                    </UncontrolledTooltip>
                </div>
            ));
        }
    }
}

export default Users;