import React, { useState } from "react";

import {
    Stack,
    Paper,
    Typography,
    Backdrop,
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

    function ShowContent() {
        return (
            <>
                <WidgetContent service={props.service} step={step} updateStep={updateStep} />
            </>
        );
    }

    function ShowControl() {
        return (
            <>
                <WidgetControl
                    step={step}
                    updateStep={updateStep}
                />
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
                        bgcolor: "section.main"
                    }}
                >
                    {ShowContent()}
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
                    {ShowControl()}
                </Stack>
            </Stack>
        );
    }

    const webdsTheme = props.service.ui.getWebDSTheme();

    return (
        <div className="jp-webds-widget-body">
            <ThemeProvider theme={webdsTheme}>
                {showAll()}
                <div>
                    <Backdrop
                        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={false}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </div>
            </ThemeProvider>
        </div>
    );
}
