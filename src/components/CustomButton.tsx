import React from 'react';
import './CustomButton.css';

type CustomButtonProps = {
    text: string;
    onClick: Function;
    style?: object;
};

const CustomButton: React.FC<CustomButtonProps> = ({ text, style, onClick }: CustomButtonProps) => (
    <button
        className="custom-button"
        onClick={(): void => {
            onClick();
        }}
        style={style}
    >
        {text}
    </button>
);

export default CustomButton;
