import React from "react";

import { useState } from 'react';

import { ThemeProvider } from "@mui/material/styles";
import { WebDSService } from '../../index';

import {
    Stack,
    Typography,
    Paper
} from '@mui/material';

import { ShowContent } from "./widget_content";
import { ShowControl } from "./widget_control";
import { SeverityType } from './widget_content';

export function ReflashWidget(
    props: {
        service: WebDSService;
    }
) {
    const [start, setStart] = useState(false);
    const [progress, setProgress] = useState(0);
    const [filelist, setFileList] = useState<string[]>([]);
    const [packratError, setPackratError] = useState(false);
    const [packrat, setPackrat] = useState("");
    const [serverity, setServerity] = useState<SeverityType>("info");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");
    const [alert, setAlert] = useState(false);

    const webdsTheme = props.service.ui.getWebDSTheme();

    const WIDTH = 800;
    const HEIGHT_TITLE = 70;
    const HEIGHT_CONTROLS = 100;

    function onProgress(value: number) {
        setProgress(prevState => { return value});
        console.log("WIDGET PROGRESS", value);
    }

    function onStart(value: boolean) {
        setStart(prevState => { return value });
        console.log("WIDGET START", value);
    }

    function onMessage(serverityParam: SeverityType, messageParam: string, linkParam: string) {
        console.log("WIDGET MESSAGE", serverity, message, link);
        setAlert(true);
        setServerity(() => { return serverityParam });
        setMessage(messageParam);
        setLink(linkParam);
    }

    function showAll() {
        return (
            <Stack spacing={2}>
                <Paper
                    elevation={0}
                    sx={{
                        width: WIDTH + "px",
                        height: HEIGHT_TITLE + "px",
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
                        Reflash
                    </Typography>
                </Paper>

                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="stretch"

                    sx={{
                        width: WIDTH + "px",
                        bgcolor: "section.main",
                    }}
                >
                    <ShowContent service={props.service}
                        start={start}
                        progress={progress}
                        setPackratError={setPackratError}
                        setFileList={setFileList}
                        setPackrat={setPackrat}
                        severity={serverity}
                        message={message}
                        link={link}
                        alert={alert}
                    />
                </Stack>
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        width: WIDTH + "px",
                        minHeight: HEIGHT_CONTROLS + "px",
                        bgcolor: "section.main",
                    }}
                >
                    <ShowControl title="Reflash" list={filelist} error={packratError}
                        onStart={onStart} onProgress={onProgress} onMessage={onMessage} service={props.service} packrat={packrat} />
                </Stack>
            </Stack>
        );
    }


    return (
        <div className='jp-webds-widget-body'>
            <ThemeProvider theme={webdsTheme}>
                {showAll()}
            </ThemeProvider>
        </div>
    );
}
