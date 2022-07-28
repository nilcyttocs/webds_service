import React, { useState } from "react";

import { Stack, Divider } from "@mui/material";

import VerticalStepper from "./steps";
import WidgetSensor from "./widgetSensor";

export default function WidgetContent(props: any) {
    const [xdir, setXdir] = useState<number[]>([1, 2, 3, 4, 5, 6]);
    const [ydir, setYdir] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    function updateX(x: any) {
        setXdir(x);
    }

    function updateY(y: any) {
        setYdir(y);
    }

    function updateStep(step: any) {
        props.updateStep(step);
    }

    return (
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            sx={{ minHeight: 480 }}
        >
            <Stack direction="row" justifyContent="flex-start" alignItems="stretch">
                <VerticalStepper
                    service={props.service}
                    step={props.step}
                    updateStep={updateStep}
                    updateX={updateX}
                    updateY={updateY}
                />
                <Divider orientation="vertical" flexItem />
            </Stack>
            <Stack direction="row" sx={{ pt: 5, pb: 5 }}>
                <WidgetSensor xdir={xdir} ydir={ydir} />
            </Stack>
        </Stack>
    );
}
