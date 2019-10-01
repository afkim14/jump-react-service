import { INCREMENT_COUNT, DECREMENT_COUNT } from '../types';

export interface IncrementCount {
    type: INCREMENT_COUNT;
}

export interface DecrementCount {
    type: DECREMENT_COUNT;
}

export type CountAction = IncrementCount | DecrementCount;

export function incrementCount(): IncrementCount {
    return {
        type: INCREMENT_COUNT,
    };
}

export function decrementCount(): DecrementCount {
    return {
        type: DECREMENT_COUNT,
    };
}
