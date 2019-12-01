import { UserDisplay } from '../../constants/Types';
import { UserAction } from '../actions/user';
import { SET_USER } from '../types';

const initialState: UserDisplay = {
    userId: '',
    displayName: '',
    color: '',
};

function userReducer(state: UserDisplay = initialState, action: UserAction): UserDisplay {
    switch (action.type) {
        case SET_USER:
            return action.payload;
        default:
            return state;
    }
}

export default userReducer;
