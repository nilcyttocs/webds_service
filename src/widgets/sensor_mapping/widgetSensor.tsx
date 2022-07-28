import React from "react";

import {
    Stack,
    Paper,
    Typography,
    Box,
    Tooltip,
    Input,
    IconButton
} from "@mui/material";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const ITEM_LENGTH_MIN = 8;
const ITEM_FONTSIZE = 15;
const ITEM_RADIUS = "5px";
const zoomIn = true;
const itemLength = ITEM_LENGTH_MIN;
const PANEL_SENSOR_MAX = 350;
const PANEL_HEIGHT_MIN = PANEL_SENSOR_MAX + 20;

interface SensorParam {
    xdir: number[];
    ydir: number[];
}

export default function WidgetSensor(props: SensorParam) {
    function getItemString(value: string) {
        let num = parseInt(value, 10);
        if (isNaN(num) || isNaN(Number(value))) {
            return "";
        }
        return num;
    }

    /*  qmao
    const handlePanelTrxChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
      direction: string
    ) => {
      var newValue = event.target.value;
  
      var user = [];
      if (direction === "y") {
        user = [...props.ydir];
        user[index] = newValue;
        setYdir(user);
      } else {
        user = [...props.xdir];
        user[index] = newValue;
        setXdir(user);
      }
    };
  
    const handlePanelTrxChangeBlur = (direction: string) => {
      var user = [];
      if (direction === "y") {
        user = props.ydir;
      } else {
        user = props.xdir;
      }
  
      if (
        (xTrxRef.current === "TX" && direction === "x") ||
        (xTrxRef.current !== "TX" && direction === "y")
      ) {
        updateTxMapping(user.toString());
      } else {
        updateRxMapping(user.toString());
      }
    };
    */

    function showAxisIcon(direction: string) {
        return (
            <IconButton disabled={true}>
                <Stack justifyContent="center" sx={{ width: 18, height: 18 }}>
                    <Typography variant="overline" color="primary" sx={{ fontSize: 18 }}>
                        {direction}
                    </Typography>
                </Stack>
            </IconButton>
        );
    }

    function displayPanel() {
        return (
            <Paper elevation={8}>
                <Stack
                    justifyContent="space-between"
                    sx={{
                        bgcolor: "black",
                        border: "2px solid grey",
                        width:
                            props.xdir.length > props.ydir.length
                                ? PANEL_SENSOR_MAX
                                : (PANEL_SENSOR_MAX * props.xdir.length) / props.ydir.length, //itemLength * xdir.length - 4,
                        height:
                            props.xdir.length <= props.ydir.length
                                ? PANEL_SENSOR_MAX
                                : (PANEL_SENSOR_MAX * props.ydir.length) / props.xdir.length //itemLength * ydir.length - 4
                    }}
                >
                    <Stack direction="row" justifyContent="space-between">
                        {props.ydir.length > 0 && (
                            <Stack alignItems="center">
                                {showAxisIcon("Y")}
                                <ArrowForwardIosIcon
                                    color="primary"
                                    sx={{
                                        transform: "rotate(270deg)"
                                    }}
                                />
                            </Stack>
                        )}
                    </Stack>

                    {props.xdir.length > 0 && (
                        <Stack alignItems="flex-end">
                            <Stack direction="row" alignItems="center">
                                <ArrowForwardIosIcon color="primary" />
                                {showAxisIcon("X")}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </Paper>
        );
    }

    return (
        <Stack
            spacing={3}
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            sx={{ width: 400 }}
        >
            <Stack
                sx={{ minHeight: PANEL_HEIGHT_MIN }}
                justifyContent="center"
                alignItems="center"
            >
                <Stack direction="row">
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            flexDirection: "column-reverse"
                        }}
                    >
                        {!zoomIn &&
                            props.ydir.map((elevation, index) => (
                                <Tooltip title={`Y${index}`} placement="right">
                                    <Input
                                        inputProps={{ style: { textAlign: "center" } }}
                                        key={`panel-input-y-${index}`}
                                        value={getItemString(elevation.toString())}
                                        ///onChange={(e) => handlePanelTrxChange(e, index, "y")}  ///qmao
                                        ////onBlur={() => handlePanelTrxChangeBlur("y")}   ///qmao
                                        sx={{
                                            fontSize: ITEM_FONTSIZE,
                                            height: itemLength,
                                            width: itemLength,
                                            border: "1px solid grey",
                                            borderRadius: ITEM_RADIUS
                                        }}
                                    />
                                </Tooltip>
                            ))}
                    </Box>

                    {displayPanel()}
                </Stack>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap"
                    }}
                >
                    {!zoomIn &&
                        props.xdir.map((elevation, index) => (
                            <Tooltip title={`X${index}`} placement="top">
                                <Input
                                    inputProps={{ style: { textAlign: "center" } }}
                                    key={`panel-input-x-${index}`}
                                    value={getItemString(elevation.toString())}
                                    ///qmao
                                    ///onChange={(e) => handlePanelTrxChange(e, index, "x")}
                                    ///onBlur={() => handlePanelTrxChangeBlur("x")}
                                    sx={{
                                        fontSize: ITEM_FONTSIZE,
                                        height: itemLength,
                                        width: itemLength,
                                        border: "1px solid grey",
                                        borderRadius: ITEM_RADIUS
                                    }}
                                />
                            </Tooltip>
                        ))}
                </Box>
            </Stack>
        </Stack>
    );
}
