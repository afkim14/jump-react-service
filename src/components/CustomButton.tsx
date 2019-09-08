import React from 'react';
import './CustomButton.css';

type CustomButtonProps = {
    text: string;
    onClick?: Function;
    style?: object;
    disabled?: boolean;
};

const CustomButton: React.SFC<CustomButtonProps> = ({ text, style, onClick, disabled }: CustomButtonProps) => (
    <button
        className={disabled ? 'disabled-button' : 'custom-button'}
        onClick={(): void => {
            if (onClick) {
                onClick();
            }
        }}
        disabled={disabled}
        style={style}
    >
        {text}
    </button>
);

export default CustomButton;
