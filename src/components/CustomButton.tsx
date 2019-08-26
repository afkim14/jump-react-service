import React from 'react';
import './CustomButton.css';

type CustomButtonProps = {
    text: string;
    onClick: Function;
    style?: object;
};

const CustomButton: React.FC<CustomButtonProps> = ({ text, style, onClick }) => (
    <button
        className="custom-button"
        onClick={() => {
            onClick();
        }}
        style={style}
    >
        {text}
    </button>
);

export default CustomButton;
