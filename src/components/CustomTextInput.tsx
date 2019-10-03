import React from 'react';
import './CustomTextInput.css';

type CustomTextInputProps = {
    onChange: Function;
    placeholder: string;
    style?: object;
    type?: string;
    value?: string;
};

const CustomTextInput: React.SFC<CustomTextInputProps> = ({
    onChange,
    placeholder,
    style,
    type,
    value
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
        value={value}
    />
);

export default CustomTextInput;
