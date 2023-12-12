import React, { ChangeEvent } from "react";
import { TextField } from "@mui/material";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface Props {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
}
export default function PhoneInputField({
  label,
  value,
  name,
  onChange,
}: Props) {
  const handlePhoneChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <TextField
      label={label}
      name={name || "phoneNumber"}
      variant="outlined"
      fullWidth
      InputProps={{
        inputComponent: PhoneInput as any,
        inputProps: {
          value,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handlePhoneChange(e.target.value),
          placeholder: "Enter phone number",
        },
      }}
    />
  );
}
