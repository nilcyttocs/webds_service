import React, { useState, useEffect } from 'react';

import {
    Typography,
    Collapse,
    Alert,
    AlertTitle,
    Stack,
    Button,
    Avatar,
    Paper,
    TextField,
    Box,
    Link
} from '@mui/material';

import FileList from './filelist'
import { green } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DehazeOutlinedIcon from '@mui/icons-material/DehazeOutlined';
import { requestAPI } from '../../handler';
import { WebDSService } from '../../index';
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';


const PACKRAT_WIDTH = 225

export type SeverityType = 'error' | 'info' | 'success' | 'warning';

interface Props {
    service: WebDSService;
    start: boolean;
    progress: number;
    setFileList: any;
    setPackratError: any;
    setPackrat: any;
    message: string;
    severity: SeverityType;
    link: string;
    alert: boolean;
}

export const ShowContent = (props: Props): JSX.Element => {
    const [packrat, setPackrat] = useState("3318382");
    const [packratError, setPackratError] = useState(false);
    const [open, setOpen] = useState(false);
    const [filelist, setFileList] = useState<string[]>([]);
    const [select, setSelect] = useState("");
    const [isAlert, setAlert] = useState(props.alert);
    const [message, setMessage] = useState(props.message);
    const [severity, setSeverity] = useState<SeverityType>(props.severity);
    const [link, setLink] = useState(props.link);
    const [result, setResult] = useState("");

    const fetchData = async () => {
        const data = await get_lists();
        console.log('data', data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        console.log(packrat);
        if (packrat === '') {
            setPackratError(true);
        }
        else if (isNaN(+Number(packrat))) {
            console.log("invalid!!");
            setPackratError(true);
        }
        else {
            setPackratError(false);
            props.setPackrat(packrat);
        }
    }, [packrat]);

    useEffect(() => {
        props.setPackratError(packratError);
    }, [packratError]);

    useEffect(() => {
        props.setFileList(filelist);
    }, [filelist]);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        console.log(props.start);
        if (props.start)
            setAlert(false);
        else {
            if (props.message != "") {
                setAlert(true);
                setMessage(props.message);
                setSeverity(props.severity);
            }
        }
        setOpen(false);
    }, [props.start]);

    useEffect(() => {
        if (open) {
            let regex = /PR\d+/g;
            let packrat_number = select.match(regex);
            if (packrat_number) {
                setPackrat(packrat_number[0].substr(2));
            }
        }
    }, [select]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setOpen(!open);
    };

    const handleUpload = (event: React.MouseEvent<HTMLElement>) => {
        (document.getElementById("icon-button-image") as HTMLInputElement).value = "";
    }

    const handlFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event);

        if (event.currentTarget.files) {
            upload_file(event.currentTarget.files[0])
                .then(() => {
                    console.log("upload file done");
                    ////setLoading(false);
                })
                .catch(error => {
                    ////setLoading(false);
                    onMessage('error', error, '');
                });
        }
    }

    const onFileDelete = (file: string, index: number) => {
        console.log("onFileDelete:", file);
        deleteFile(file);
    };

    const onFileSelect = (file: string) => {
        setSelect(file);
        console.log("onFileSelect:", file);
    };

    const onMessage = (severityParam: SeverityType, messageParam: string, linkParam: string) => {
        setMessage(messageParam);
        setSeverity(severityParam);
        setResult(severityParam.toUpperCase());
        setLink(linkParam);

        console.log(severityParam);
        console.log(messageParam);
        console.log(result);
        console.log(link);

        setAlert(true);
    };

    const deleteFile = async (filename: string): Promise<string | undefined> => {
        console.log("delete");
        let packratnum = filename.split(".")[0].substr(2);
        const dataToSend = { file: filename };

        console.log(packratnum);
        console.log(dataToSend);

        try {
            const url = `packrat/${packratnum}/${filename}`;
            const reply = await requestAPI<any>(url, { method: 'DELETE' });
            console.log(reply);
            await get_lists().then(list => {
                if (packrat == packratnum) {
                    if (list!.indexOf(filename) == -1) {
                        setPackrat("");
                        setSelect("");
                    }
                }
            });

            return reply;
        } catch (error) {
            if (error) {
                return error.message
            }
        }
    }


    const get_list = async (exetension: string): Promise<string[] | undefined> => {
        try {

            const reply = await requestAPI<any>('packrat?extension=' + exetension, {
                method: 'GET',
            });
            console.log(reply);

            let list = reply["filelist"].map((value: string) => {
                let res = value.split("/");
                return res[1];
            });
            return Promise.resolve(list);
        } catch (error) {
            console.log(error);
            return Promise.reject(error.message);
        }
    }

    const get_lists = async (): Promise<string[] | undefined> => {
        try {
            let list = await get_list("img");

            setFileList(list!);
            return Promise.resolve(list);
        } catch (error) {
            console.log(error);
            setFileList([]);
            return Promise.reject(error.message);
        }
    }

    const upload_img = async (file: File): Promise<string> => {
        console.log("upload img file:", file);
        const regex = /PR\d+/g;
        const packrat = file.name.match(regex);
        let fileName = '';
        let packratID = '';

        try {
            if (!packrat)
                return Promise.reject('invalid file name');
            packratID = packrat![0].substr(2)
            fileName = 'PR' + packratID + '.img';

            const formData = new FormData();
            formData.append("fileToUpload", file, fileName);

            await requestAPI<any>('packrat/' + packratID, {
                body: formData,
                method: 'POST'
            });
        } catch (error) {
            console.error(`Error - POST /webds/packrat/${packratID}\n${error}`);
            return Promise.reject('Failed to upload blob to Packrat cache');
        }
        return Promise.resolve(fileName);
    }

    const upload_file = async (file: File) => {
        console.log("upload_file:", file);

        if (file) {
            try {
                let filename = await upload_img(file);
                await get_lists();
                setSelect(filename)
            }
            catch (error) {
                console.log(error);
                onMessage('error', error, '')
            }
        }
    }


    const webdsTheme = props.service.ui.getWebDSTheme();

    interface TextFieldWithProgressProps {
        packrat: string;
        progress: number;
        color?: string;
    }

    function TextFieldWithProgress(
        props: TextFieldWithProgressProps
    ) {
        return (
            <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                    }}
                >
                    <Paper sx={{ bgcolor: green[200], width: (props.progress * PACKRAT_WIDTH / 100), height: 39 }} />
                </Box>

                <TextField
                    value={props.packrat}
                    id="outlined-size-small"
                    size="small"
                    sx={{ width: PACKRAT_WIDTH }}
                />
            </Box>
        );
    }

    return (
        <div>
            <ThemeProvider theme={webdsTheme}>
                <CssBaseline />
            <Collapse in={isAlert}>
                <Alert severity={severity} onClose={() => setAlert(false)}>
                    <AlertTitle> {result} </AlertTitle>
                    { message }
                    <Link href={ link }>{ link }</Link>
                </Alert>
            </Collapse>

            <Stack
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                sx={{ mr: 8, mb:4, py: 3 }}
            >
                <Stack spacing={1}
                    direction="column"
                    justifyContent="flex-start"
                    sx={{ mt: 5 }}>
                    <Button variant="text" onClick={handleClick} sx={{ pt: 1 }}>
                        <Avatar sx={{ bgcolor: webdsTheme.palette.primary.light }} variant="rounded">
                            {open ?
                                <CloseIcon fontSize="large" />
                                :
                                <DehazeOutlinedIcon fontSize="large" />
                            }
                        </Avatar>
                    </Button>
                    {open &&
                        <div>
                            <input
                                accept=".img"
                                id="icon-button-img"
                                onChange={handlFileChange}
                                type="file"
                                hidden
                            />
                            <label htmlFor="icon-button-img">
                                <Button variant="text" onClick={handleUpload} component="span">
                                    <Avatar sx={{ bgcolor: webdsTheme.palette.primary.light }} variant="rounded">
                                        <CloudUploadIcon fontSize="large" />
                                    </Avatar>
                                </Button>
                            </label>
                        </div>
                    }
                </Stack>

                <Stack spacing={1} sx={{
                    flexDirection: 'column',
                    display: 'flex',
                    alignItems: "center",
                    width: 275
                }}>
                    <Typography sx={{ m: 1, textAlign: 'center' }}>
                        {open ? "Image Files" : "Packrat"}
                    </Typography>

                    {open ?
                        <Paper variant="outlined" sx={{ m: 0, p: 0, minWidth: 265, /*minHeight: 42*/ }}>
                            <FileList list={filelist} onDelete={onFileDelete} onSelect={onFileSelect} select={select} />
                        </Paper>
                        :
                        props.start ?
                            <TextFieldWithProgress packrat={packrat} progress={props.progress} />
                            :
                            <TextField id="filled-basic"
                                value={packrat}
                                onChange={(e) => setPackrat(e.target.value)}
                                error={packratError}
                                size="small"
                                sx={{
                                    width: PACKRAT_WIDTH,
                                }}
                            />
                    }
                </Stack>
            </Stack>
            </ThemeProvider>
            </div>
    );
}