import { SET_USER } from '../types';
import { UserDisplay } from '../../constants/Types';

export interface SetUser {
    type: SET_USER;
    payload: UserDisplay;
}

export type UserAction = SetUser;

export function setUser(user: UserDisplay): SetUser {
    return {
        type: SET_USER,
        payload: user,
    };
}
