import React from "react";
import { Select, TextField, MenuItem } from "@mui/material";
import { countryCodes } from "../../constant/index";
import "./style.scss";

interface Props {
  countryCode: { label: string; value: string; key: string };
  tel: string;
  disabled?: boolean;
  onChangeCountryCode: (e: React.ChangeEvent<{ value: any }>) => void;
  onChangeTel: (e: React.ChangeEvent<{ value: any }>) => void;
}
export default function CustomizedSelect({
  countryCode,
  tel,
  disabled,
  onChangeCountryCode,
  onChangeTel,
}: Props) {
  return (
    <>
      <Select
        id="countryCode"
        value={countryCode.key}
        className="select"
        classes={{ outlined: "outlined" }}
        variant="outlined"
        disabled={disabled || false}
        renderValue={() => "+ " + countryCode.value}
        onChange={onChangeCountryCode}
      >
        {Object.values(countryCodes).map((option: any) => (
          <MenuItem value={option.key} key={option.key}>
            + {option.value} {option.label}
          </MenuItem>
        ))}
      </Select>
      <TextField
        id="tel"
        onChange={onChangeTel}
        className="input"
        disabled={disabled || false}
        classes={{ root: "inputRoot" }}
        value={tel}
        type="tel"
        variant="outlined"
      />
    </>
  );
}
