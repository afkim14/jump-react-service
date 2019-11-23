import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import MainHome from '../views/MainHome';
import { setUser } from '../store/actions/user';
import { addRoom, removeRoom, updateRoom } from '../store/actions/room';
import { StoreState } from '../store/types';
import { UserDisplay, Room } from '../constants/Types';

const mapStateToProps = (state: StoreState) => ({
    user: state.user,
    rooms: state.rooms,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setUser: (user: UserDisplay) => dispatch(setUser(user)),
    addRoom: (room: Room) => dispatch(addRoom(room)),
    removeRoom: (roomId: string) => dispatch(removeRoom(roomId)),
    updateRoom: (roomId: string, room: Room) => dispatch(updateRoom(roomId, room)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainHome);
