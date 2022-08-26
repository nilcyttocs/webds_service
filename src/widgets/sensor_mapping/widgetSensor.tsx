import React, { useEffect, useState } from "react";

import {
  Stack,
  Typography,
  Box,
  IconButton,
  Divider
} from "@mui/material";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

//const ITEM_LENGTH = "24px";
//const ITEM_FONTSIZE = 12;

const PANEL_SENSOR_MAX = 350;
const PANEL_HEIGHT_MIN = PANEL_SENSOR_MAX + 20;

/*
const MyPopover = styled(Popover)(({ theme }) => ({
  "& .MuiPaper-root": { background: "transparent" },
  "& .MuiPaper-rounded": { background: "transparent" },
  "& .MuiPaper-elevation": { background: "transparent" }
}));
*/

interface SensorParam {
  xdir: number[];
  ydir: number[];
  axis: boolean;
}

interface ISensorPoint {
  state: boolean;
  x: number | undefined;
  y: number | undefined;
  xNumber: number | undefined;
  yNumber: number | undefined;
}

export default function WidgetSensor(props: SensorParam) {
  const [xLength, setXLength] = useState(0);
  const [yLength, setYLength] = useState(0);
  const [sensorPoint, setSensorPoint] = useState<ISensorPoint>({
    state: false,
    x: undefined,
    y: undefined,
    xNumber: undefined,
    yNumber: undefined
  });

  useEffect(() => {
    let xlen = 0;
    let ylen = 0;
    if (props.xdir.length > props.ydir.length) {
      xlen = PANEL_SENSOR_MAX;
      ylen = (PANEL_SENSOR_MAX * props.ydir.length) / props.xdir.length;
    } else {
      xlen = (PANEL_SENSOR_MAX * props.xdir.length) / props.ydir.length;
      ylen = PANEL_SENSOR_MAX;
    }
    setXLength(xlen);
    setYLength(ylen);
  }, [props.xdir, props.ydir]);

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

  function hover(
    event: any,
    x: number | undefined,
    y: number | undefined,
    xNumber: number | undefined,
    yNumber: number | undefined,
    state: boolean
  ) {
    if (state) {
      setSensorPoint({
        state: state,
        x: x,
        y: y,
        xNumber: xNumber,
        yNumber: yNumber
      });
    } else {
      setSensorPoint({
        state: state,
        x: undefined,
        y: undefined,
        xNumber: undefined,
        yNumber: undefined
      });
    }
  }

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

  function displayPoints() {
    let xdir = props.xdir;
    let ydir = [...props.ydir].reverse();

    let xGap = 20;
    let yGap = 20;

    let xLineGap = 20;
    let yLineGap = 20;

    if (ydir.length !== 0) {
      let count = ydir.length === 1 ? 1 : ydir.length - 1;
      yGap = yLength / count;
      yLineGap = (yLength - 4) / count;
    } else {
      ydir = [-1];
    }
    if (xdir.length !== 0) {
      let count = xdir.length === 1 ? 1 : xdir.length - 1;
      xGap = xLength / count;
      xLineGap = (xLength - 4) / count;
    } else {
      xdir = [-1];
    }

    return (
      <>
        <Divider
          sx={{
            top: 2 + sensorPoint.y * yLineGap,
            left: 0,
            position: "absolute",
            width: xLength,
            bgcolor: "white"
          }}
        />
        {sensorPoint.yNumber >= 0 && (
          <Stack
            justifyContent="center"
            sx={{
              width: 30,
              height: 30,
              top: sensorPoint.y * yLineGap - yLineGap,
              left: -30,
              display: "flex",
              alignItems: "center",
              position: "absolute"
            }}
          >
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontSize: 16 }}
            >
              {sensorPoint.yNumber}
            </Typography>
          </Stack>
        )}

        <Divider
          orientation="vertical"
          sx={{
            top: 0,
            left: 2 + sensorPoint.x * xLineGap,
            position: "absolute",
            bgcolor: "white"
          }}
        />
        {sensorPoint.xNumber >= 0 && (
          <Stack
            justifyContent="center"
            sx={{
              width: 18,
              height: 18,
              top: yLength + 10,
              left: 2 + sensorPoint.x * xLineGap - xLineGap / 2,
              display: "flex",
              alignItems: "center",
              position: "absolute"
            }}
          >
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontSize: 16 }}
            >
              {sensorPoint.xNumber}
            </Typography>
          </Stack>
        )}
        {xdir.map((xElement, xindex) =>
          ydir.map((yElement, yindex) => (
            <Box
              key={`sensor-box-${xindex}-${yindex}`}
              sx={{
                top: yindex * yGap - yGap / 2,
                left: xindex * xGap - xGap / 2,
                position: "absolute",
                display: "flex",
                alignItems: "center",
                width: xGap,
                height: yGap
                //":hover": {
                // bgcolor: "pink"
                //}
              }}
              onMouseEnter={(e) =>
                hover(e, xindex, yindex, xElement, yElement, true)
              }
              onMouseLeave={(e) =>
                hover(e, xindex, yindex, xElement, yElement, false)
              }
            ></Box>
          ))
        )}
      </>
    );
  }

  function displayPanel() {
    return (
      <Stack
        justifyContent="space-between"
        sx={{
          bgcolor: "black",
          border: "1px solid grey",
          width: xLength,
          height: yLength,
          position: "relative",
          display: "inline-flex"
        }}
      >
        {props.ydir.length > 0 && sensorPoint.state === false && (
          <Stack direction="row" justifyContent="space-between">
            <Stack alignItems="center">
              {showAxisIcon("Y")}
              <ArrowForwardIosIcon
                color="primary"
                sx={{
                  transform: "rotate(270deg)"
                }}
              />
            </Stack>
          </Stack>
        )}

        {props.xdir.length > 0 && sensorPoint.state === false && (
          <Box
            sx={{
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center"
            }}
          >
            <ArrowForwardIosIcon color="primary" />
            {showAxisIcon("X")}
          </Box>
        )}
        {displayPoints()}
      </Stack>
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
        <Stack direction="row">{displayPanel()}</Stack>
      </Stack>
    </Stack>
  );
}
