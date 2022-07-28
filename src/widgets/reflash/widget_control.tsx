import React, { useState, useEffect, useRef } from 'react';
import { requestAPI } from '../../handler';

import { Box, Typography, Button } from '@mui/material';
import { ThemeProvider } from "@mui/material/styles";
import { WebDSService } from '../../index';

interface Props {
    children?: React.ReactNode;
    index?: any;
    value?: any;
    title?: any;
    alert?: any;
    error: any;
    list: any;
    packrat: any;
    onStart: any;
    onProgress: any;
    onMessage: any;
    service: WebDSService;
}

declare global {
    var source: EventSource;
}

export const ShowControl = (props: Props): JSX.Element => {
    const { children, value, index, title, alert, error, list, onStart, onProgress, onMessage, ...other } = props;
    const [disable, setDisable] = useState(false);
    const [progress, setProgress] = React.useState(0);
    const [isStart, setStart] = React.useState(false);

    const link = useRef("");

    interface Response {
        status: string;
        message: string;
    }

    const eventHandler = (event: any) => {
        let obj = JSON.parse(event.data);
        //console.log(obj)

        if (obj.progress) {
            setProgress(obj.progress);
        }
        if (obj.status && obj.message) {
            setStatus(false, obj.status == 'success', JSON.stringify(obj.message));
        }
    }

    const go = (file: string) => {
        setStatus(true);
        globalThis.source = new window.EventSource('/webds/reflash');
        console.log(globalThis.source);
        if (globalThis.source != null) {
            globalThis.source.addEventListener('reflash', eventHandler, false);
        }
        else {
            console.log("event source is null");
        }
        start_reflash(file)
            .then(res => {
                setStatus(true);
            })
            .catch((error) => {
                console.log(error, 'Promise error');
                setStatus(false, false, error);
         })
    }

    useEffect(() => {
        props.onProgress(progress);
    }, [progress]);

    useEffect(() => {
        let file: string;

        props.onStart(isStart);

        if (isStart) {

            let match = props.list.find((element: string) => {
                if (element.includes(props.packrat)) {
                    return true;
                }
            });

            console.log(props.list);

            if (!match) {
                console.log("download image from packrat server");
                file = props.packrat;
                start_fetch(file).then(res => {
                    go(res);
                })
                .catch((error) => {
                    console.log(error, 'Promise error');
                    setStatus(false, false, error);
                })
            }
            else {
                file = props.packrat + "/" + match;
                if (file == "") {
                    setStatus(false, false, "Please choose an image file");
                }
                go(file);
            }
        }
    }, [isStart]);

    const setStatus = (start: boolean, status?: boolean, result?: string) => {
        if (start) {
            link.current = "";
        }
        else {
            console.log(result);
            show_result(status!, result || '');
            setStart(false);
            console.log(globalThis.source)
            if (globalThis.source != undefined && globalThis.source.addEventListener != null) {
                globalThis.source.removeEventListener('reflash', eventHandler, false);
                globalThis.source.close();
                console.log("close event source");
            }
        }

        setProgress(0);
        setDisable(start);
    }

    const show_result = (pass: boolean, message: string) => {
        console.log("pass:", pass);

        onMessage(pass ? "success" : "error", message, link.current);

        console.log(pass);
    }

    const start_reflash = async (file_name: string): Promise<Response | undefined> => {
        const action = "start";
        const dataToSend = {
            filename: file_name,
            action: action
        };

        console.log("filename:", file_name);

        try {
            const reply = await requestAPI<any>('reflash', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(reply);
            return Promise.resolve(reply);
        } catch (e) {
            console.error(
                `Error on POST ${dataToSend}.\n${e}`
            );
            return Promise.reject((e as Error).message);
        }
    }

    const start_fetch = async (packrat: string): Promise<string> => {
        console.log(packrat);
        let path = '';
        try {
            let files = await props.service.packrat.cache.addPackratFiles([value], Number(packrat!));
            path = packrat + "/PR" + packrat + '.img';
            console.log(files);
            console.log(path);
            return Promise.resolve(path);
        }
        catch (error) {
            console.log(error);
        }
        return Promise.resolve("Image file not found");
    }

    const webdsTheme = props.service.ui.getWebDSTheme();

    return (
        <ThemeProvider theme={webdsTheme}>
            <Box sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    mb: 1
            }}>
                <div {...other}>
                    <Button disabled={disable || error}
                        color="primary"
                        variant="contained"
                        onClick={() => setStart(true)}
                        sx={{ width: 150, mt: 1 }}>
                        { isStart &&
                        <Typography
                            variant="caption"
                            component="div"
                            color="text.secondary"
                            sx={{mr:1}}
                        >
                        {`${Math.round(progress)}%`}
                        </Typography>
                        }
                        { title }
                    </Button>
                </div>
            </Box>
        </ThemeProvider>
    );
}
