import React from 'react';
import '../assets/components/CustomTextInput.scss';

type CustomTextInputProps = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    style?: object;
    type?: string;
    value?: string;
};

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    onChange,
    placeholder,
    style,
    type,
    value,
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
