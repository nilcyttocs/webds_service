import React, { useState } from "react";

import {
  Stack,
  Paper,
  Typography,
  CircularProgress
} from "@mui/material";

import { ThemeProvider } from "@mui/material/styles";
import WidgetContent from "./widgetContent";
import WidgetControl from "./widgetControl";

const WIDGET_WIDTH = 900;
const WIDGET_HEIGHT_TITLE = 70;
const WIDGET_HEIGHT_CONTROLS = 70;

export function SensorMappingWidget(props: any) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState(false);
  const [initState, setInitState] = useState(false);

  function ShowTitle(title: string) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: WIDGET_WIDTH + "px",
          height: WIDGET_HEIGHT_TITLE + "px",
          position: "relative",
          bgcolor: "section.main"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          {title}
        </Typography>
      </Paper>
    );
  }

  function updateStep(step: number) {
    setStep(step);
  }

  function updateStatus(status: boolean) {
    setStatus(status);
  }

  function updateInitState(status: boolean) {
    setInitState(status);
  }

  function ShowContent() {
    return (
      <>
        <WidgetContent
          service={props.service}
          step={step}
          updateStep={updateStep}
          updateStatus={updateStatus}
		  updateInitState={updateInitState}
        />
      </>
    );
  }

  function ShowControl() {
    return (
      <>
        <WidgetControl step={step} updateStep={updateStep} status={status} />
      </>
    );
  }

  function showAll() {
    return (
      <Stack spacing={2}>
        {ShowTitle("Sensor Mapping")}

        <Stack
          direction="column"
          justifyContent="center"
          alignItems="stretch"
          sx={{
            width: WIDGET_WIDTH + "px",
            bgcolor: "section.main",
			position: "relative",
            display: "inline-flex"
          }}
        >
          {ShowContent()}
		  { !initState &&
			<div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }}
            >
              <CircularProgress color="primary" />
			</div>
          }
        </Stack>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="stretch"
          sx={{
            width: WIDGET_WIDTH + "px",
            minHeight: WIDGET_HEIGHT_CONTROLS + "px",
            bgcolor: "section.main"
          }}
        >
          { initState && ShowControl() }
        </Stack>
      </Stack>
    );
  }

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <div className="jp-webds-widget-body">
      <ThemeProvider theme={webdsTheme}>
		{ showAll() }
      </ThemeProvider>
    </div>
  );
}

