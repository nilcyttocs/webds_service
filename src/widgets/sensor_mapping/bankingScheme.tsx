import React, { useEffect, useState } from "react";
import List from "@mui/material/List";
import {
    Divider,
    Radio,
    Stack,
    Typography,
    Button,
    Tooltip,
    Paper
} from "@mui/material";
import { extensionConst } from "./constant";

const BANKING_ITEM_HEIGHT = 30;
const BANKING_ITEM_LIST_HEIGHT = BANKING_ITEM_HEIGHT + 2;
const BANKING_LIST_WIDTH = 420;
const BANKING_ITEM_LIST_WIDTH = BANKING_LIST_WIDTH - 100;

export default function BankingScheme(props: any) {
    const [checked, setChecked] = useState("");
    const [title, setTitle] = useState([]);
    const [selectedBankingScheme, setSelectedBankingScheme] = useState<
        string | undefined
    >(undefined);

    useEffect(() => {
        var title: any = Object.values(
            extensionConst.bankingScheme[props.asic]["Banking"]
        );
        var t = [];
        t = title.map((value) => {
            let data = value.slice(3);
            return data;
        });
        setTitle(t);
    }, []);

    useEffect(() => {
        setChecked(props.defaultSelect);
        props.onSelect(props.defaultSelect, props.bankingSchemeConfig, false);
    }, [props.defaultSelect]);

    const handleToggle = (value: string) => () => {
        if (!props.expanded) return;
        if (checked === value) {
            setChecked("");
            setSelectedBankingScheme(undefined);
        } else {
            setChecked(value);
            const found = props.bankingListAll.find(
                (element) => element["id"] === value
            );
            setSelectedBankingScheme(found);
        }
        props.onSelect(value, props.bankingSchemeConfig, true);
    };

    function getTRxText(data: any) {
        var title: any = Object.values(
            extensionConst.bankingScheme[props.asic]["Banking"]
        );
        var row = [];
        data.map((value, index) => {
            var pin = title[index].slice(3);
            row.push([value, pin]);
        });
        return row;
    }

    function showItem(
        content: string,
        info: string,
        id0: string,
        id1: string,
        id2: string
    ) {
        return (
            <Stack>
                <Tooltip title={info} placement="top">
                    <Typography
                        variant="overline"
                        key={`list-trx-${id0}-${id1}-${id2}`}
                        sx={{ textAlign: "center" }}
                    >
                        {content}
                    </Typography>
                </Tooltip>
            </Stack>
        );
    }

    function showItems(
        up: string,
        down: string,
        id0: string,
        id1: string,
        id2: string
    ) {
        return (
            <Stack direction="row">
                <Typography
                    variant="overline"
                    key={`list-trx-${id0}-${id1}-${id2}`}
                    sx={{ textAlign: "center" }}
                >
                    {up}
                    {down}
                </Typography>
            </Stack>
        );
    }

    function getTRxCountText(axis: any) {
        var count = props.bankingSchemeConfig[axis]["count"];

        return (
            <>
                {showItems(`T${count[0]}`, `R${count[1]}`, count[0], count[1], "axis")}
            </>
        );
    }

    function showBankingTRx(item: any) {
        var block = Object.values(item);
        var content = getTRxText(block.slice(1));
        return content;
    }

    function dispalyBankingScheme() {
        var showList = [];
        if (!props.expanded) {
            if (selectedBankingScheme !== undefined) {
                showList = [selectedBankingScheme];
            }
        } else {
            showList = props.bankingListAll;
        }
        return (
            <Paper square elevation={1}>
                <Stack direction="row">
                    <Paper elevation={0} sx={{ width: 100 }} />
                    <Stack
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        sx={{ width: BANKING_ITEM_LIST_WIDTH }}
                    >
                        {title.map((value) => {
                            return (
                                <Typography
                                    key={`list-title-${value}`}
                                    sx={{ fontSize: 12 }}
                                >
                                    {value}
                                </Typography>
                            );
                        })}
                    </Stack>
                    <Paper elevation={0} sx={{ pl: 1 }} />
                </Stack>
                <Divider />
                {showList.map((value, index) => {
                    var axis_sense = value["id"];
                    const labelId = `checkbox-list-label-${axis_sense}-${index}`;
                    return (
                        <Stack
                            key={`listitem-root-${axis_sense}-${index}`}
                            sx={{ height: BANKING_ITEM_LIST_HEIGHT, p: 0, b: 0, m: 0 }}
                            spacing={2}
                        >
                            <Button
                                variant="text"
                                key={`listitem-button-${axis_sense}-${index}`}
                                onClick={handleToggle(axis_sense)}
                                sx={{ m: 0, p: 0, width: BANKING_LIST_WIDTH }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="flex-start"
                                    alignItems="center"
                                >
                                    <Radio
                                        id={labelId}
                                        key={`radio-${axis_sense}-${index}`}
                                        checked={axis_sense === checked}
                                        value={axis_sense}
                                        name="radio-buttons"
                                        inputProps={{ "aria-label": "B" }}
                                    />

                                    <Stack
                                        direction="row"
                                        key={`list-trx-count-root-${axis_sense}-${index}`}
                                        sx={{
                                            height: BANKING_ITEM_LIST_HEIGHT,
                                            b: 0,
                                            m: 0
                                        }}
                                    >
                                        <Typography
                                            variant="overline"
                                            key={`list-trx-count-${axis_sense}-${index}`}
                                            sx={{ textAlign: "center", width: 50 }}
                                        >
                                            {getTRxCountText(axis_sense)}
                                        </Typography>
                                        <Divider
                                            orientation="vertical"
                                            flexItem
                                            key={`list-divider-${index}-${axis_sense}`}
                                        />
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        justifyContent="space-around"
                                        alignItems="center"
                                        sx={{ width: BANKING_ITEM_LIST_WIDTH }}
                                    >
                                        {showBankingTRx(value).map((content, indexSub) => {
                                            return (
                                                <>
                                                    {showItem(
                                                        content[0],
                                                        content[1],
                                                        axis_sense,
                                                        `${indexSub}`,
                                                        content[1]
                                                    )}
                                                </>
                                            );
                                        })}
                                    </Stack>
                                </Stack>
                            </Button>
                        </Stack>
                    );
                })}
            </Paper>
        );
    }

    return (
        <Stack alignItems="center">
            <List
                sx={{ width: BANKING_LIST_WIDTH, bgcolor: "background.paper", p: 0 }}
            >
                {dispalyBankingScheme()}
            </List>
        </Stack>
    );
}
