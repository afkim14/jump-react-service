import { CountAction } from '../actions/count';

import { INCREMENT_COUNT, DECREMENT_COUNT } from '../types';

const initialState = 0;

function countReducer(state: number = initialState, action: CountAction): number {
    switch (action.type) {
        case INCREMENT_COUNT:
            return state + 1;
        case DECREMENT_COUNT:
            return state - 1;
        default:
            return state;
    }
}

export default countReducer;
