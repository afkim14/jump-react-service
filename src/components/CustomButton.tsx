import React from 'react';
import '../assets/components/CustomButton.scss';

type CustomButtonProps = {
    text: string;
    onClick?: () => void;
    style?: object;
    disabled?: boolean;
    className?: string;
};

const CustomButton: React.FC<CustomButtonProps> = ({
    text,
    style,
    onClick,
    disabled,
    className,
}: CustomButtonProps) => (
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
