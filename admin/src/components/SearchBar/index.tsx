import React from "react";
import {
  Menu,
  MenuItem,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { StatusLabel } from "../../constant";
import "./style.scss";

interface Props {
  search: (event: React.ChangeEvent<any>) => void;
  time: string;
  status: string;
  handleStatusFilter: (option: string) => void;
  handleTimeFilter: (option: string) => void;
  disabled: boolean;
  options: {
    timeOptions: string[];
    statusOptions: string[];
  };
}
export default function CardContainer({
  search,
  disabled,
  handleStatusFilter,
  handleTimeFilter,
  options,
  time,
  status,
}: Props) {
  const TimeSelector = () => {
    const [anchorTime, setAnchorTime] = React.useState<null | HTMLElement>(
      null
    );
    const handleTimeSelect = (option: string) => {
      handleTimeFilter(option);
      setAnchorTime(null);
    };
    return (
      <div>
        <Button
          aria-controls="time"
          disabled={disabled}
          aria-haspopup="true"
          className="searchBtn"
          onClick={(e) => setAnchorTime(e.currentTarget)}
          endIcon={<ExpandMoreIcon />}
        >
          {time}
        </Button>
        <Menu
          id="time"
          anchorEl={anchorTime}
          keepMounted
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          open={Boolean(anchorTime)}
          onClose={() => setAnchorTime(null)}
        >
          <MenuItem key="all" onClick={() => handleTimeSelect("time")}>
            {"显示全部"}
          </MenuItem>
          {options.timeOptions.map((option) => (
            <MenuItem key={option} onClick={() => handleTimeSelect(option)}>
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  };
  const StatusSelector = () => {
    const [anchorStatus, setAnchorStatus] = React.useState<null | HTMLElement>(
      null
    );
    const handleStatusSelect = (option: string) => {
      handleStatusFilter(option);
      setAnchorStatus(null);
    };
    return (
      <div>
        <Button
          aria-controls="status"
          onClick={(e) => setAnchorStatus(e.currentTarget)}
          disabled={disabled}
          className="searchBtn"
          aria-haspopup="true"
          endIcon={<ExpandMoreIcon></ExpandMoreIcon>}
        >
          {StatusLabel[status]}
        </Button>
        <Menu
          id="status"
          anchorEl={anchorStatus}
          keepMounted
          open={Boolean(anchorStatus)}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          onClose={() => setAnchorStatus(null)}
        >
          <MenuItem key="all" onClick={() => handleStatusSelect("ALL")}>
            {"显示全部"}
          </MenuItem>
          {options.statusOptions.map((option) => (
            <MenuItem key={option} onClick={() => handleStatusSelect(option)}>
              {StatusLabel[option]}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  };
  return (
    <Paper className="searchBar" elevation={0}>
      <div className="selectForm">
        <TimeSelector />
        <StatusSelector />
      </div>
      <div className="searchForm">
        <TextField
          id="searchInput"
          name="searchInput"
          variant="outlined"
          fullWidth
          placeholder="用户名/产品名/订单号/快递单号"
          disabled={disabled}
          onChange={search}
          InputProps={{
            className: "input",
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <SearchIcon style={{ color: "#979797" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </div>
    </Paper>
  );
}
