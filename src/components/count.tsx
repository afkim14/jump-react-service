import React, { FC } from 'react';

type CountProps = {
    increment: () => void;
    decrement: () => void;
    count: number;
};

const countExample: FC<CountProps> = (props: CountProps) => (
    <div>
        <button onClick={props.increment}>Increment</button>
        <button onClick={props.decrement}>Decrement</button>
        <p>{props.count}</p>
    </div>
);

export default countExample;
