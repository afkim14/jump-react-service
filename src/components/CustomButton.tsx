import React from 'react';
import './CustomButton.css';

type CustomButtonProps = {
    text: string;
    onClick?: Function;
    style?: object;
    disabled?: boolean;
    className?: string;
};

const CustomButton: React.SFC<CustomButtonProps> = ({ text, style, onClick, disabled, className }: CustomButtonProps) => (
    <button
        className={`${disabled ? 'disabled-button' : 'custom-button'} ${className}`}
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
