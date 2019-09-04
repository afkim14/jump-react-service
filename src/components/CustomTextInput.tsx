import React from 'react';
import './CustomTextInput.css';

type CustomTextInputProps = {
    onChange: Function;
    placeholder: string;
    style?: object;
    type?: string;
};

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    onChange,
    placeholder,
    style,
    type,
}: CustomTextInputProps) => (
    <input
        className="custom-text-input"
        onChange={(e): void => {
            onChange(e);
        }}
        spellCheck={false}
        placeholder={placeholder}
        style={style}
        type={type}
        autoComplete="true"
    />
);

export default CustomTextInput;
